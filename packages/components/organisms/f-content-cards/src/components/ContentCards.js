import BrazeAdapter from '@justeat/f-braze-adapter';
import { globalisationServices } from '@justeat/f-services';
import tenantConfigs from '../tenants';
import {
    GET_CARD_COUNT,
    HAS_LOADED,
    ON_ERROR,
    ON_METADATA_INIT,
    VOUCHER_CODE_CLICK
} from '../events';

export const CARDSOURCE_METADATA = 'metadata';
export const CARDSOURCE_CUSTOM = 'custom';

export const STATE_DEFAULT = 'default';
export const STATE_ERROR = 'error';
export const STATE_NO_CARDS = 'no-cards';
export const STATE_LOADING = 'loading';

/**
 * Generates card-specific analytics data suitable for sending back to GTM via f-trak
 *
 * @param contentAction
 * @param card
 * @returns {{contentCTA, customVoucherCode, contentId: *, contentAction: *, contentPosition, contentTitle: *, contentType: string}}
 */
const createMetadataCardEvent = (contentAction, card) => {
    const {
        id: contentId,
        title: contentTitle,
        order: contentPosition,
        ctaText: contentCTA,
        voucherCode: customVoucherCode
    } = card;

    return {
        contentId,
        contentType: 'contentCard',
        customVoucherCode,
        contentTitle,
        contentAction,
        contentPosition,
        contentCTA
    };
};

/**
 * Generates custom card-specific analytics data suitable for sending back to GTM via f-trak
 *
 * @param {String} action
 * @param {Object} card
 * @returns {Object}
 */
const createCustomCardEvent = (action, card) => {
    const {
        headline: name,
        ctaText: cta
    } = card;

    return {
        event: 'Promotion',
        custom: {
            Promotion: {
                name,
                type: 'justeat_contentCard',
                id: null,
                voucher: null,
                action,
                cta
            }
        }
    };
};

export default {
    props: {
        apiKey: {
            type: String,
            default: ''
        },
        userId: {
            type: String,
            default: ''
        },
        customCards: {
            type: Array,
            default: () => []
        },
        pushToDataLayer: {
            type: Function,
            default: () => (() => {})
        },
        locale: {
            type: String,
            default: ''
        },
        testId: {
            type: String,
            default: null
        },
        tags: {
            type: String,
            default: 'content-cards'
        }
    },
    data: () => ({
        cards: [],
        hasLoaded: false,
        state: STATE_LOADING,
        loggingKey: null,
        defaultLoggingData: {}
    }),
    computed: {
        /**
         * Determines the tenant based on the currently selected locale in order to choose correct translations
         * @return {String}
         **/
        tenant () {
            return {
                'en-GB': 'uk',
                'en-AU': 'au',
                'en-NZ': 'nz',
                'da-DK': 'dk',
                'es-ES': 'es',
                'en-IE': 'ie',
                'it-IT': 'it',
                'nb-NO': 'no'
            }[this.locale] || 'uk';
        }
    },
    watch: {
        /**
         * Determines what card impressions should be logged, and whether the loaded flag should be set
         * @param {Card[]} current
         * @param {Card[]} previous
         **/
        cards (current, previous) {
            this.$emit(GET_CARD_COUNT, current.length);

            if (current.length && (current.length !== previous.length)) {
                this.brazeAdapter.logCardImpressions(this.cards.map(({ id }) => id));
            }
            if ((current.length > 0) && (previous.length === 0)) {
                this.state = STATE_DEFAULT;
                this.hasLoaded = true;
            }
            if (current.length === 0) {
                this.state = STATE_NO_CARDS;
            }
        },

        customCards (current) {
            if (!this.cards.length && current.length) {
                this.customContentCards(current);
            }
        },

        /**
         * Monitors the loaded flag to emit the has-loaded event if necessary
         * @param {Boolean} current
         * @param {Boolean} previous
         **/
        hasLoaded (current, previous) {
            if (current && !previous) {
                this.$emit(HAS_LOADED, true);
            }
        }
    },
    mounted () {
        this.loggingKey = `f-content-cards--${this.userId}--${this.tags}`;
        this.defaultLoggingData = {
            tags: this.tags,
            data: {
                key: this.loggingKey
            }
        };
        this.setupMetadata(this.apiKey, this.userId);
    },
    /**
     * Sets up dependencies required by descendant components
     **/
    provide () {
        const component = this;

        const locale = globalisationServices.getLocale(tenantConfigs, this.locale, this.$i18n);
        const localeConfig = tenantConfigs[locale];

        return {
            /**
             * Reflects card click events though to common click event handler
             **/
            emitCardClick (card) {
                component.handleCardClick(card);
            },

            /**
             * Reflects card view events though to common view event handler
             **/
            emitCardView (card) {
                component.handleCardView(card);
            },

            /**
             * Emits voucher code click event with given ongoing url
             **/
            emitVoucherCodeClick (url) {
                component.$emit(VOUCHER_CODE_CLICK, {
                    url
                });
            },

            copy: { ...localeConfig }
        };
    },
    methods: {
        /**
         * Initializes metadata and handles success / failure states from the returned promise
         * @param {String} apiKey
         * @param {String} userId
         * @param {Boolean} enableLogging
         * @return {void}
         **/
        setupMetadata (apiKey, userId, enableLogging = false) {
            try {
                this.$logger.logInfo(
                    `Content Cards (setupMetadata) - Attempting to initialise BrazeAdapter. Key: (${this.loggingKey})`,
                    this.$store,
                    {
                        ...this.defaultLoggingData
                    }
                );

                this.brazeAdapter = new BrazeAdapter({
                    apiKey,
                    userId,
                    enableLogging,
                    enabledCardTypes: [
                        'Header_Card',
                        'Promotion_Card_1',
                        'Promotion_Card_2',
                        'Recommendation_Card_1',
                        'Restaurant_FTC_Offer_Card',
                        'Voucher_Card_1',
                        'Terms_And_Conditions_Card',
                        'Terms_And_Conditions_Card_2',
                        'Anniversary_Card_1',
                        'Post_Order_Card_1',
                        'Home_Promotion_Card_1',
                        'Home_Promotion_Card_2',
                        'Stamp_Card_1',
                        'StampCard_Promotion_Card_1'
                    ],
                    brands: this.brands,
                    callbacks: {
                        handleContentCards: this.metadataContentCards
                    },
                    logger: this.$logger,
                    tags: this.tags
                });

                this.$logger.logInfo(
                    `Content Cards (setupMetadata) - BrazeAdapter successfully initialised. Key: (${this.loggingKey})`,
                    this.$store,
                    {
                        ...this.defaultLoggingData
                    }
                );
            } catch (e) {
                this.$logger.logError(
                    `Content Cards (setupMetadata) - Failed to initialise BrazeAdapter successfully. Key: (${this.loggingKey})`,
                    this.$store,
                    {
                        ...this.defaultLoggingData,
                        error: {
                            message: e.message
                        }
                    }
                );
                this.state = STATE_ERROR;
                this.$emit(ON_ERROR, e);
            }
        },
        /**
         * Common method for handling card ingestion to component. Card list length of 0 (after filtering) is considered
         * 'successful' but does not overwrite any cards currently in place, in order to maintain cards that are present
         * @param {String} source
         * @param {Function} successCallback
         * @param {Function} failCallback
         * @param {Card[]} cards
         **/
        contentCards ({
            source,
            successCallback = () => {},
            failCallback = () => {}
        }, cards) {
            if (cards === undefined) {
                return failCallback();
            }

            if (!(source === CARDSOURCE_METADATA && this.cards.length !== 0)) {
                this.cards = cards.map(card => Object.assign(card, { source }));
            }

            return successCallback();
        },

        /**
         * Handles card ingestion via metadata
         * @param {Card[]} cards
         **/
        metadataContentCards (cards) {
            this.contentCards({
                source: CARDSOURCE_METADATA,
                successCallback: () => {
                    this.$emit('on-braze-init', window.appboy); // deprecated -- for backward compatibility
                    this.$emit(ON_METADATA_INIT, window.appboy);
                    this.$logger.logInfo(
                        `Content Cards (metadataContentCards) - Successfully received content cards. Key: (${this.loggingKey})`,
                        this.$store,
                        {
                            ...this.defaultLoggingData,
                            Count: cards.length,
                            data: {
                                ...this.defaultLoggingData.data,
                                source: CARDSOURCE_METADATA
                            }
                        }
                    );
                },
                failCallback: () => {
                    this.$logger.logError(
                        `Content Cards (metadataContentCards) - Failed to receive content cards array, undefined given. Key: (${this.loggingKey})`,
                        this.$store,
                        {
                            ...this.defaultLoggingData
                        }
                    );
                }
            }, cards);
        },

        /**
         * Handles custom card ingestion
         * @param {Card[]} cards
         **/
        customContentCards (cards) {
            this.$logger.logInfo(
                `Content Cards (customContentCards) - Attempting to load cards via custom source. Key: (${this.loggingKey})`,
                this.$store,
                {
                    ...this.defaultLoggingData,
                    Count: cards.length,
                    data: {
                        ...this.defaultLoggingData.data,
                        source: CARDSOURCE_CUSTOM
                    }
                }
            );
            this.contentCards({
                source: CARDSOURCE_CUSTOM
            }, cards);
        },

        /**
         * Takes appropriate response for click event for given card object based on its source
         * @param card
         */
        handleCardClick (card) {
            switch (card.source) {
                case CARDSOURCE_METADATA:
                    this.trackMetadataCardClick(card);
                    this.brazeAdapter.logCardClick(card.id);
                    break;
                case CARDSOURCE_CUSTOM:
                    this.trackCustomCardClick(card);
                    break;
                default:
                    this.$logger.logError(
                        `Content Cards (handleCardClick) - Invalid card source type. Key: (${this.loggingKey})`,
                        this.$store,
                        {
                            ...this.defaultLoggingData,
                            data: {
                                ...this.defaultLoggingData.data,
                                source: CARDSOURCE_METADATA
                            }
                        }
                    );
                    throw new Error('Invalid card source type');
            }
        },

        /**
         * Takes appropriate response for view event for given card object based on its source
         * @param card
         */
        handleCardView (card) {
            switch (card.source) {
                case CARDSOURCE_METADATA:
                    this.trackMetadataCardVisibility(card);
                    break;
                case CARDSOURCE_CUSTOM:
                    this.trackCustomCardVisibility(card);
                    break;
                default:
                    this.$logger.logError(
                        `Content Cards (handleCardView) - Invalid card source type. Key: (${this.loggingKey})`,
                        this.$store,
                        {
                            ...this.defaultLoggingData,
                            data: {
                                ...this.defaultLoggingData.data,
                                source: card.source
                            }
                        }
                    );
                    throw new Error('Invalid card source type');
            }
        },

        /**
         * Generates a click event for the given card data and reports using the common method
         * @param card
         */
        trackMetadataCardClick (card) {
            const event = createMetadataCardEvent('click', card);
            this.brazeAdapter.pushShapedEventToDataLayer(this.pushToDataLayer, event);
        },

        /**
         * Generates a click event for the given card data and reports using the common method
         * @param card
         */
        trackCustomCardClick (card) {
            const event = createCustomCardEvent('click', card);
            this.pushToDataLayer(event);
        },

        /**
         * Generates a view event for the given card data and reports using the common method
         * @param card
         */
        trackMetadataCardVisibility (card) {
            const event = createMetadataCardEvent('view', card);
            this.brazeAdapter.pushShapedEventToDataLayer(this.pushToDataLayer, event);
        },

        /**
         * Generates a view event for the given card data and reports using the common method
         * @param card
         */
        trackCustomCardVisibility (card) {
            const event = createCustomCardEvent('view', card);
            this.pushToDataLayer(event);
        }
    },

    /**
     * Render function for the component - chooses one slot based on the current state
     * @param h - conventional shorthand for createElement - see
     *            https://vuejs.org/v2/guide/render-function.html#JSX
     * @return {VNode}
     */
    render (h) {
        return this.$scopedSlots[this.state]
            ? h(
                'div',
                {
                    class: `c-contentCards-${this.state}`,
                    attrs: {
                        'data-test-id': this.testId
                    }
                },
                this.$scopedSlots[this.state]({
                    cards: this.cards
                })
            )
            : h('');
    }
};

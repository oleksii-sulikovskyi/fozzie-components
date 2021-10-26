<template>
    <div
        class="c-listing-item-rating">
        <div
            class="c-rating c-rating--small c-listing-item-ratingStars">
            <span :class="'c-rating--fill ' + ratingClass" />
        </div>
        <p>
            <!-- {{ $t('restaurant.meta.rating.star', {
                mean,
                max: 6
            }) }} -->
        </p>
        <span
            data-test-id="restaurant-rating"
            class="is-visuallyHidden">
            <!-- {{ $t('restaurant.meta.rating.star', {
                mean,
                max: 6
            }) }} -->
        </span>
        <strong
            class="c-listing-item-ratingText"
            data-test-id="rating">
            <!-- {{ $t(ratingsMessage, { count } ) }} -->
        </strong>
    </div>
</template>

<script>
import restaurantRatingsService from './services/restaurantRatings.service';

export default {
    name: 'RestaurantRating',
    props: {
        mean: {
            type: Number,
            default: null
        },
        count: {
            type: Number,
            default: null
        },
        isCustomerRating: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            ratingClass: restaurantRatingsService.ratingClass(this.mean)
        };
    },
    computed: {
        ratingsMessage () {
            return this.isCustomerRating
                ? 'restaurant.meta.rating.yourReview'
                : 'restaurant.meta.rating.count';
        }
    }
};
</script>

<style lang="scss">
.c-rating {
    background-image: url('../../assets/images/icons/stars/star--empty.svg');
}

.c-rating--fill {
    background-image: url('../../assets/images/icons/stars/star--filled.svg');
}
</style>

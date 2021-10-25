// Uncomment the import below to add prop controls to your Story (and add `withKnobs` to the decorators array)
// import {
//     withKnobs, select, boolean
// } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import RestaurantCard from '../src/components/RestaurantCard.vue';
import restaurantLogo from './assets/images/mcdonalds-logo.gif';
import restaurantImage from './assets/images/mcdonalds.webp';

export default {
    title: 'Components/Molecules',
    decorators: [withA11y]
};

export const RestaurantCardComponent = (args, { argTypes }) => ({
    components: { RestaurantCard },
    props: Object.keys(argTypes),
    template:  `<restaurant-card v-bind="$props">
                    <template v-slot:cuisines>
                        <span>pizza</span>
                        -
                        <span>burgers</span>
                    </template>
                    <template v-slot:new-label>
                        <p>Is New</p>
                    </template>
                </restaurant-card>`
});

RestaurantCardComponent.args = {
    locale: 'en-GB',
    data: {
        id: '00000',
        name: "McDonald's® - London - St Paul's",
        disabled: false,
        logoUrl: restaurantLogo,
        imgUrl: restaurantImage,
        isListItem: false,
        url: 'some-restaurant/12345',
        rating: {
            mean: 5,
            count: 1400,
            isCustomerRating: false
        }
    },

    flags: {
        fancyNewTitle: false,
        experimentalBadges: true
    },

    version: 'v1'
};

RestaurantCardComponent.storyName = 'f-restaurant-card';

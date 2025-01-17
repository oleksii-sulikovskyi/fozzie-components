import _mergeJSXProps from "babel-helper-vue-jsx-merge-props";
export default {
  name: 'PaymentVisaIcon',
  props: {},
  functional: true,
  render: function render(h, ctx) {
    var attrs = ctx.data.attrs || {};
    ctx.data.attrs = attrs;
    return h("svg", _mergeJSXProps([{
      attrs: {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 72.6 45.8"
      },
      "class": "c-ficon c-ficon--payment-visa"
    }, ctx.data]), [h("path", {
      attrs: {
        d: "M72.6 43.1c0 1.5-1.2 2.7-2.7 2.7H2.7c-1.5 0-2.7-1.2-2.7-2.7V2.7C0 1.2 1.2 0 2.7 0h67.2c1.5 0 2.7 1.2 2.7 2.7v40.4z",
        fill: "#1a1f71"
      }
    }), h("path", {
      attrs: {
        d: "M27.6 13.3l-8.1 19.3h-5.3l-4-15.4c-.2-.9-.5-1.3-1.2-1.7-1.2-.6-3.2-1.3-4.9-1.6l.1-.6h8.5c1.1 0 2.1.7 2.3 2l2.1 11.2 5.2-13.1h5.3zm20.6 12.9c0-5.1-7-5.4-7-7.6 0-.7.7-1.4 2.1-1.6.7-.1 2.7-.2 4.9.9l.9-4.1c-1.2-.4-2.7-.9-4.7-.9-4.9 0-8.4 2.6-8.4 6.4 0 2.8 2.5 4.3 4.4 5.2 1.9.9 2.6 1.5 2.6 2.4 0 1.3-1.5 1.9-3 1.9-2.5 0-4-.7-5.1-1.2l-.9 4.2c1.2.5 3.3 1 5.5 1 5.3 0 8.7-2.6 8.7-6.6m13.1 6.3h4.6l-4-19.3h-4.3c-1 0-1.8.6-2.1 1.4L48 32.5h5.2l1-2.9h6.4l.7 2.9zm-5.6-6.8l2.6-7.2 1.5 7.2h-4.1zm-21-12.4l-4.1 19.3h-5l4.1-19.3h5z",
        fill: "#fff"
      }
    })]);
  }
};
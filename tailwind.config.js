module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.{t,j}s{x,}'
  ],
  theme: {
    extend: {
      colors: {
        night: "#080F0F",
        auburn: "#A52422",
        cream: "#EFF2C0",
        ashgray: "#A4BAB7",
        khaki: "#BEA57D"
      },
      screens: {
        xs: '375px',
      },
      height: {
        'screen-minus-header': 'calc(100vh - 4rem)',
      },
      minWidth: {
        'screen': '100vw'
      },
    }
  }
}

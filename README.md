# JavaScript Range Slider

This slider is built with vanilla JS. It's reusable, customizable and easy to use.

## Getting started

To use the range slider plugin, simply include the app.js in your HTML file:

```
<script src="path/to/app.js"></script>
```

Then, create a new range slider instance by calling the Slider constructor and passing in the options:

```javascript
const slider = new Slider(options);
```

Pass in the DOM element where you want the slider to appear. Then, pass in as many sliders as you need to the sliders array. Each slider object has several options for customization.

```javascript
const options = {
    DOMselector: string,
    sliders: [
      {
        radius: number,
        min: number,
        max: number,
        step: number,
        initialValue: number,
        color: string,
        displayName: string
      }
    ]
};
```

* selector -> your container selector (i.e. #mySlider, can be any valid selector)
* sliders -> array of options objects for sliders
* radius -> radius of the slider (i.e. 100)
* min -> minimum value of the slider (i.e. 100)
* max -> maximum value of the slider (i.e. 100)
* step -> value step (i.e. 10)
* initialValue -> value of the slider on initialization (i.e. 50)
* color -> color of the slider (valid hex code value)
* displayName -> name of the legend item (any string)

Call the draw method() on the new instance of the Slider class.

```javascript
slider.draw();
```

That's it!

## Special thanks to
Sabine - for finding a bug in the calculation of the relative client coordinates and pointing it out!

# Concentric Circular Range Slider with JS

This slider is built with vanilla JS. It's reusable, customizable and easy to use.

## How to use

1. Define an option object. 

```javascript
const exampleOptions = {
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

Additional explanation:

* selector -> your container selector (i.e. #yourSelector, can be any valid selector)
* sliders -> array of options objects for sliders
* radius -> radius of the slider (i.e. 100)
* min -> minimum value of the slider (i.e. 100)
* max -> maximum value of the slider (i.e. 100)
* step -> value step (i.e. 10)
* initialValue -> value of the slider on initialization (i.e. 50)
* color -> color of the slider (valid hex code value)
* displayName -> name of the legend item (any string)

2. Make a new instance of the Slider Class and call the draw() method

```javascript
const slider = new Slider(exampleOptions);
slider.draw();
```

That's it!

## Special thanks to
Sabine - for finding a bug in the calculation of the relative client coordinates and pointing it out!

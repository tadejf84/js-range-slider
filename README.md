# Concentric Circular Range Slider with JS and SVG

This slider is built with vanilla JS. It's reusable, customizable and easy to use.

# How to use

1. Define an option object with the name of your choice. 

```javascript
let exampleOptions = {
    DOMselector: string,
    sliders: [
      {
        radius: number,
        min: number,
        max: number,
        step: number,
        startValue: number,
        color: string,
        displayContainer: string,
        displayName: string
      }
    ]
};
```

Additional explanation:

* selector -> your container selector (i.e. #yourSelector, can be class or id)
* radius -> radius of the slider (i.e. 100)
* min -> minimum value of the slider (i.e. 100)
* max -> maximum value of the slider (i.e. 100)
* step -> value step (i.e. 10)
* startValue -> value of the slider on initialization - before events trigger (i.e. 50)
* color -> color of the slider (valid hex code value)
* displayContainer -> your display (legend) container selector (i.e. #yourDisplay, can be class or id)
* displayName -> name of the display - legend (any string, not empty)

2. Make a new instance of the Slider Class and run buildSlider() method

```javascript
let slider = new Slider(exampleOptions);
slider.buildSlider();
```

That's it! And you can draw as many sliders as you want by creating new instances of the Slider Class.

# Special thanks!

I would like to thank Žiga Šebenik (Codepen) and Jithin B (Stackoverflow) and a few others for inspiration.
When I got stuck, your code snippets were very helpful in overcoming this challenge. Thanks again!

References:

* [Reference 1](https://codepen.io/ziga/pen/amKxRj)
* [Reference 2](https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle)

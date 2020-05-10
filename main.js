class Slider {

  constructor({
    selector = null,
    radius = null,
    min = null,
    max = null,
    step = null,
    startValue = null,
    color = null,
    displayContainer = null,
    displayName = null
    }) {
    this.selector = selector;
    this.radius = radius;
    this.min = min;
    this.max = max;
    this.step = step;
    this.startVal = startValue;
    this.color = color;
    this.displayContainer = displayContainer;
    this.displayName = displayName;
  }

  buildSlider () {
    'use strict';

    let li, firstSpan, secondSpan, thirdSpan, div,
        errorMsgCont,
        errorMsg = [],
        slidersAll = [],
        numArcFractions,
        totalSpacing,
        singleSpacing,
        sliderGroup,
        sliderBgPath,
        sliderActiveBgPath,
        sliderActivePath,
        handle,
        handleCenter,
        slider,
        scrollLeft,
        scrollTop,
        clientLeft,
        clientTop;

    // constant tau
    const tau = 2 * Math.PI;

    // slider settings
    let sliderSettings = {
      contSelector: this.selector,
      radius: this.radius,
      circumference: this.radius * tau,
      min: this.min,
      max: this.max,
      range: this.max - this.min,
      step: this.step,
      currentValue: this.startVal,
      currentAngle: Math.floor((this.startVal/ (this.max - this.min)) * 360),
      arcBgFractionBetweenSpacing: 0.9,
      arcBgFractionLength: 10,
      arcBgFractionThickness: 25,
      arcBgFractionColor: '#D8D8D8',
      arcActiveFractionLength: 10,
      arcActiveStrokeColor: this.color,
      arcActiveFractionBorderColor: '#D8D8D8',
      arcActiveFractionBorderThickness: 0.9
    };

    // slider handle settings
    let handleSettings = {
      handleFillColor: '#fff',
      handleStrokeColor: '#888888',
      handleStrokeThickness: 3
    };

    // active slider settings
    let activeSlider = {
      'slider': null,
      'mouseDown': false
    }

    // display settings
    let displaySettings = {
      displayContainer: this.displayContainer,
      displayName: this.displayName,
      displayColor: this.color
    }

    // slider container width, height and center
    const selector = this.selector;
    const container = document.querySelector(this.selector);
    const contWidth = container.width.baseVal.value;
    const contHeight = container.height.baseVal.value;
    const cx = contWidth / 2;
    const cy = contHeight / 2;

    // container for value display
    const dispCont = document.querySelector(displaySettings.displayContainer);

    // check user input for errors
    function checkUserInput() {
      errorMsgCont = document.querySelector('#errorMsg');

      checkIfString(sliderSettings.contSelector, errorMsg);
      checkIfNum(sliderSettings.radius, errorMsg);
      checkIfNum(sliderSettings.min, errorMsg);
      checkIfNum(sliderSettings.max, errorMsg);
      checkIfNum(sliderSettings.step, errorMsg);
      checkIfNum(sliderSettings.currentValue, errorMsg);
      checkIfString(sliderSettings.arcActiveStrokeColor, errorMsg);
      checkIfString(displaySettings.displayContainer, errorMsg);
      checkIfString(displaySettings.displayName, errorMsg);

      // error message display
      for(let i = 0; i < errorMsg.length; i++) {
        let li = document.createElement('li');
        li.innerHTML = errorMsg[i];
        errorMsgCont.appendChild(li);
      }
    }

    // init sliders -draw sliders before any events are fired
    function initSlider() {
      calcSpaceBetweenFractions();

      // create a group for all elements, append it to the svg container
      sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      sliderGroup.setAttribute('class', 'sliderSingle');
      sliderGroup.setAttribute('transform', 'rotate(-90,' + cx + ',' + cy + ')');
      sliderGroup.setAttribute('rad', sliderSettings.radius);
      container.appendChild(sliderGroup);

      // create background for single slider, append it to group
      sliderBgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sliderBgPath.setAttribute('class', 'sliderSingleBg');
      sliderBgPath.setAttribute('d', describeArc(cx, cy, sliderSettings.radius, 0, 360));
      sliderBgPath.style.stroke = sliderSettings.arcBgFractionColor;
      sliderBgPath.style.strokeWidth = sliderSettings.arcBgFractionThickness;
      sliderBgPath.style.fill = 'none';
      sliderBgPath.setAttribute('stroke-dasharray', sliderSettings.arcBgFractionLength + ' ' + singleSpacing);
      sliderGroup.appendChild(sliderBgPath);

      // create background path for active slider, append it to group
      sliderActiveBgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sliderActiveBgPath.setAttribute('class', 'sliderSingleActiveBg');
      sliderActiveBgPath.setAttribute('d', describeArc(cx, cy, sliderSettings.radius, 0, sliderSettings.currentAngle ));
      sliderActiveBgPath.style.stroke = sliderSettings.arcActiveFractionBorderColor;
      sliderActiveBgPath.style.strokeWidth = sliderSettings.arcBgFractionThickness + 1;
      sliderActiveBgPath.style.fill = 'none';
      sliderGroup.appendChild(sliderActiveBgPath);

      // create path for active slider, append it to group
      sliderActivePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      sliderActivePath.setAttribute('class', 'sliderSingleActivePath');
      sliderActivePath.setAttribute('id', 'active');
      sliderActivePath.setAttribute('d', describeArc(cx, cy, sliderSettings.radius, 0, sliderSettings.currentAngle));
      sliderActivePath.style.stroke = sliderSettings.arcActiveStrokeColor;
      sliderActivePath.style.strokeWidth = sliderSettings.arcBgFractionThickness;
      sliderActivePath.style.fill = 'none';
      sliderActivePath.setAttribute('stroke-dasharray', sliderSettings.arcActiveFractionLength + ' ' + sliderSettings.arcActiveFractionBorderThickness);
      sliderGroup.appendChild(sliderActivePath);

      // create handle for slider, append it to group
      handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      handleCenter = calcHandleCenter( sliderSettings.currentAngle * tau / 360, sliderSettings.radius);
      handle.setAttribute('class', 'sliderHandle');
      handle.setAttribute('cx', handleCenter.x);
      handle.setAttribute('cy', handleCenter.y);
      handle.setAttribute('r', sliderSettings.arcBgFractionThickness / 2);
      handle.style.stroke = handleSettings.handleStrokeColor;
      handle.style.strokeWidth = handleSettings.handleStrokeThickness;
      handle.style.fill = handleSettings.handleFillColor;
      sliderGroup.appendChild(handle);

      // push slider to array for later use
      slider = sliderGroup;
      slider.sliderBgPath = sliderBgPath;
      slider.sliderActiveBgPath = sliderActiveBgPath;
      slider.sliderActivePath = sliderActivePath;
      slider.handle = handle;
      slidersAll.push(slider);
    }

    // create display html markup and add start values
    function createValueDisplay (sliders) {
      li = document.createElement('li');
      firstSpan = document.createElement('span');
      firstSpan.innerHTML = sliderSettings.currentValue;
      secondSpan = document.createElement('span');
      secondSpan.style.backgroundColor = displaySettings.displayColor;
      thirdSpan = document.createElement('span');
      thirdSpan.innerHTML = displaySettings.displayName;
      div = document.createElement('div');
      div.setAttribute('class', 'colorSquare');

      for (let slider of sliders) {
        dispCont.appendChild(li);
        li.appendChild(firstSpan);
        li.appendChild(secondSpan).appendChild(div);
        li.appendChild(thirdSpan);
      }
    }

    // attach event listeners
    container.addEventListener('mousedown', mouseTouchStart.bind(this), false);
    container.addEventListener('touchstart', mouseTouchStart.bind(this), false);
    container.addEventListener('mousemove', mouseTouchMove.bind(this), false);
    container.addEventListener('touchmove', mouseTouchMove.bind(this), false);
    window.addEventListener('mouseup', mouseTouchEnd.bind(this), false);
    window.addEventListener('touchend', mouseTouchEnd.bind(this), false);

    // redraw active slider on event trigger
    function redrawSlider (slider) {
      handleCenter = calcHandleCenter(sliderSettings.currentAngle, sliderSettings.radius);
      slider.sliderActiveBgPath.setAttribute('d', describeArc(cx, cy, sliderSettings.radius, 0,  sliderSettings.currentAngle * (360 / tau) ));
      slider.sliderActivePath.setAttribute('d', describeArc(cx, cy, sliderSettings.radius, 0, sliderSettings.currentAngle * (360 / tau) ));
      slider.handle.setAttribute('cx', handleCenter.x);
      slider.handle.setAttribute('cy', handleCenter.y);
    }

    // activate slider on mouse down or touch start event
    function mouseTouchStart (e) {
      if (activeSlider.mouseDown) { return; }
      let rmc = getRelativeMouseCoordinates(e);
      activateSlider(rmc);
    }

    // deactivate slider on mouse up or touch end event
    function mouseTouchEnd() {
      if (!activeSlider.mouseDown) { return; }
      activeSlider.mouseDown = false;
      activeSlider.slider = null;
      firstSpan.removeAttribute('class');
    }

    // get new values for active slider on mouse move or touch move event
    function mouseTouchMove(e) {
      if (!activeSlider.mouseDown) { return; }
      e.preventDefault();
      let rmc = getRelativeMouseCoordinates(e);
      calcValuesForActiveSlider(rmc);
    }

    // activate slider function
    let activateSlider = (rmc) => {
      let rmcR, rOffset;
      rmcR = rmc.r;
      rOffset = sliderSettings.arcBgFractionThickness / 2;

      for(let slider of slidersAll) {
        if ((rmcR > sliderSettings.radius - rOffset) && (rmcR < sliderSettings.radius + rOffset)) {
          activeSlider.slider = slider;
          activeSlider.mouseDown = true;
        }
        calcValuesForActiveSlider(rmc);
        break;
      }
    }

    // calculate new values for active slider
    function calcValuesForActiveSlider (rmc) {
      let mouseAngle, actualValue, relativeValue, numOfSteps;

      mouseAngle = calcMouseAngle(rmc);
      actualValue = mouseAngle / tau * sliderSettings.range + sliderSettings.min;
      relativeValue = actualValue - sliderSettings.min;
      numOfSteps = Math.round(relativeValue / sliderSettings.step);
      actualValue = sliderSettings.min + numOfSteps * sliderSettings.step;
      mouseAngle = (actualValue - sliderSettings.min) / sliderSettings.range * tau;
      sliderSettings.currentAngle = mouseAngle * 0.999;
      sliderSettings.currentValue = actualValue;

      updateDisplayValues(sliderSettings.currentValue);
      redrawSlider(activeSlider.slider);
    }

    // update slider values in the display container
    function updateDisplayValues (value) {
      if (!activeSlider.mouseDown) { return; }
      firstSpan.innerHTML = value;
      firstSpan.setAttribute('class', 'active');
    }


    /****************
    HELPER FUNCTIONS
    ****************/
    // check input is string and not empty
    function checkIfString(input, arr) {
      let inputType;
      switch(input) {
        case sliderSettings.contSelector:
          inputType = 'container';
          break;
        case sliderSettings.arcActiveStrokeColor:
          inputType = 'color';
          break;
        case displaySettings.displayContainer:
          inputType = 'display container';
          break;
        case displaySettings.displayName:
          inputType = 'display name';
          break;
        default:
          inputType = 'data';
      }
      if(typeof input !== 'string' || !input) {
        arr.push('Your ' + inputType + ' input is not valid! Not a string or empty!');
      }
    }

    // check that input is number and not empty
    function checkIfNum(input, arr) {
      let inputType;
      switch(input) {
        case sliderSettings.radius:
          inputType = 'radius';
          break;
        case sliderSettings.min:
          inputType = 'minimum';
          break;
        case sliderSettings.max:
          inputType = 'maximum';
          break;
        case sliderSettings.step:
          inputType = 'step';
          break;
        case sliderSettings.currentValue:
          inputType = 'start value';
          break;
        default:
          inputType = 'data';
      }
      if(typeof input !== 'number' || input === undefined) {
        arr.push('Your ' + inputType + ' input is not valid! Not a number or empty!');
      }
    }

    /*
    calculate space between fractions
    total unused space divided by num of arc fractions
    */
    function calcSpaceBetweenFractions() {
      numArcFractions = Math.floor((sliderSettings.circumference / sliderSettings.arcBgFractionLength) * sliderSettings.arcBgFractionBetweenSpacing);
      totalSpacing = sliderSettings.circumference - numArcFractions * sliderSettings.arcBgFractionLength;
      singleSpacing = totalSpacing / numArcFractions;
    }

    // function polar to cartesian transformation
    function polarToCartesian (centerX, centerY, radius, angleInDegrees) {
      let angleInRadians = angleInDegrees * Math.PI / 180;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }

    // function describe arc
    function describeArc (x, y, radius, startAngle, endAngle) {
      let endAngleOriginal, start, end, arcSweep, path;
      endAngleOriginal = endAngle;

      if(endAngleOriginal - startAngle === 360){
          endAngle = 359;
      }

      start = polarToCartesian(x, y, radius, endAngle);
      end = polarToCartesian(x, y, radius, startAngle);
      arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

      if (endAngleOriginal - startAngle === 360) {
        path = [
              'M', start.x, start.y,
              'A', radius, radius, 0, arcSweep, 0, end.x, end.y, 'z'
        ].join(' ');
      } else {
        path = [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y
        ].join(' ');
      }

      return path;
    }

    // calculate handle center
    function calcHandleCenter (angle, radius) {
      let x, y, center;
      x = cx + Math.cos(angle) * radius;
      y = cy + Math.sin(angle) * radius;
      return center = {
        'x': x,
        'y': y
      };
    }

    // calculate mouse angle
    function calcMouseAngle (rmc) {
      let  rmcX, rmcY, angle;
      rmcX = rmc.x;
      rmcY = rmc.y;
      angle = Math.atan2(rmcY - cy, rmcX - cx);

      if (angle > - tau / 2 && angle < - tau / 4) {
        return angle + tau * 1.25;
      } else {
        return angle + tau * 0.25;
      }
    }

    // get mouse coordinates relative to the top and left of the container
    function getRelativeMouseCoordinates (e) {
      let x, y, r;

      // set window offsets
      const containerRect = container.getBoundingClientRect();
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
      scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
      clientTop = document.documentElement.clientTop || document.body.clientTop || 0;

      x = e.pageX - containerRect.left - scrollLeft - clientLeft;
      y = e.pageY - containerRect.top - scrollTop - clientTop;
      r = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2));
      return {'x': x, 'y': y, 'r': r};
    }

    /****************
    FUNCTIONS TO BE RUN BEFORE EVENTS
    ****************/
    checkUserInput();
    initSlider();
    createValueDisplay(slidersAll);

  }
}

let options1 = {
  selector: '#sliderSvg',
  radius: 80,
  min: 0,
  max: 100,
  step: 10,
  startValue: 50,
  color: '#fdcb6e',
  displayContainer: '#displayValues',
  displayName: 'Value 1'
};

let options2 = {
  selector: '#sliderSvg',
  radius: 160,
  min: 0,
  max: 300,
  step: 10,
  startValue: 200,
  color: '#0984e3',
  displayContainer: '#displayValues',
  displayName: 'Value 2'
};

let options3 = {
  selector: '#sliderSvg',
  radius: 120,
  min: 0,
  max: 1000,
  step: 50,
  startValue: 100,
  color: '#00b894',
  displayContainer: '#displayValues',
  displayName: 'Value 3'
};

let options4 = {
  selector: '#sliderSvg',
  radius: 40,
  min: 0,
  max: 200,
  step: 10,
  startValue: 20,
  color: '#d63031',
  displayContainer: '#displayValues',
  displayName: 'Value 4'
};

let slider1 = new Slider(options1);
slider1.buildSlider();

let slider2 = new Slider(options2);
slider2.buildSlider();

let slider3 = new Slider(options3);
slider3.buildSlider();

let slider4 = new Slider(options4);
slider4.buildSlider();

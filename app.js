class Slider {

    constructor({ DOMselector, sliders }) {

        this.DOMselector = DOMselector;
        this.container = document.querySelector(this.DOMselector);  // slider container
        this.sliderWidth = 400;                                     // slider width
        this.sliderHeight = 400;                                    // slider length
        this.cx = this.sliderWidth / 2;                             // slider center X coordinate
        this.cy = this.sliderHeight / 2;                            // slider center Y coordinate
        this.tau = 2 * Math.PI;                                     // Tau constant
        this.sliders = sliders;                                     // sliders array with opts for each slider
        this.arcFractionSpacing = 0.85;                             // spacing between arc fractions
        this.arcFractionLength = 10;
        this.arcFractionThickness = 25;
        this.arcBgFractionColor = '#D8D8D8';

        // handle opts
        this.handleFillColor = '#fff';
        this.handleStrokeColor = '#888888';
        this.handleStrokeThickness = 3;

        this.mouseDown = false;
        this.activeSlider = null;
    }


    /**
     * Draw sliders on init
     * 
     */
    draw() {

        // Update legend UI
        this.outputLegendUI();

        // Create and append SVG holder first
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('slider__data');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'sliderSvg');
        svg.setAttribute('height', this.sliderWidth);
        svg.setAttribute('width', this.sliderHeight);
        svgContainer.appendChild(svg);
        this.container.appendChild(svgContainer);

        // Draw sliders
        this.sliders.forEach( (slider, index) => this.drawSingleSlider(svg, slider, index) );

        // Event listeners
        svgContainer.addEventListener('mousedown', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('touchstart', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('mousemove', this.mouseTouchMove.bind(this), false);
        svgContainer.addEventListener('touchmove', this.mouseTouchMove.bind(this), false);
        window.addEventListener('mouseup', this.mouseTouchEnd.bind(this), false);
        window.addEventListener('touchend', this.mouseTouchEnd.bind(this), false);
    }


    /**
     * Draw single slider
     *
     */
    drawSingleSlider(svg, slider, index) {
        this.outputSliderSVG (svg, slider, index);
    }

    /**
     * Generate SVG markup for slider
     * 
     */
    outputSliderSVG (svg, slider, index) {

        const circumference = slider.radius * this.tau;
        const initialAngle = Math.floor( (slider.initialValue / (slider.max - slider.min)) * 360 );

        // Calculate spacing between arc fractions
        const arcFractionSpacing = this.calculateSpacingBetweenArcFractions(circumference, this.arcFractionLength, this.arcFractionSpacing);

        // Create a single slider group - holds background and active paths
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('class', 'sliderSingle');
        sliderGroup.setAttribute('data-slider', index);
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.cx + ',' + this.cy + ')');
        sliderGroup.setAttribute('rad', slider.radius);
        svg.appendChild(sliderGroup);
        
        // Create single slider background
        this.outputArcPath( this.arcBgFractionColor, slider.radius, 360, arcFractionSpacing, 'bg', sliderGroup);

        // Create background for single slider
        this.outputArcPath( slider.color, slider.radius, initialAngle, arcFractionSpacing, 'active', sliderGroup);

        // Draw handle
        this.drawHandle(slider, initialAngle, sliderGroup );
    }


    /**
     * Draw handle for single slider
     * 
     * @param {object} slider 
     */
    drawHandle(slider, initialAngle, group) {
        const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const handleCenter = this.calculateHandleCenter( initialAngle * this.tau / 360, slider.radius);
        handle.setAttribute('class', 'sliderHandle');
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);
        handle.setAttribute('r', this.arcFractionThickness / 2);
        handle.style.stroke = this.handleStrokeColor;
        handle.style.strokeWidth = this.handleStrokeThickness;
        handle.style.fill = this.handleFillColor;
        group.appendChild(handle);
    }



    /**
     * Output arch path
     * 
     * @param {number} cx 
     * @param {number} cy 
     * @param {string} color 
     * @param {number} angle 
     * @param {number} singleSpacing 
     * @param {string} type 
     */
    outputArcPath( color, radius, angle, singleSpacing, type, group ) {

        // Slider path class
        const pathClass = (type === 'active') ? 'sliderSinglePathActive' : 'sliderSinglePath';

        // Create svg path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add(pathClass);
        path.setAttribute('d', this.describeArc(this.cx, this.cy, radius, 0, angle));
        path.style.stroke = color;
        path.style.strokeWidth = this.arcFractionThickness;
        path.style.fill = 'none';
        path.setAttribute('stroke-dasharray', this.arcFractionLength + ' ' + singleSpacing);

        // Append path to svg group
        group.appendChild(path);
    }

    
    outputLegendUI() {
        const display = document.createElement('ul');
        display.setAttribute('id', 'displayValues');
        display.classList.add('slider__legend');
        const heading = document.createElement('h2');
        heading.innerText = 'Legend';

        // Create legend for all sliders
        this.sliders.forEach( (slider, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-slider', index);
            const firstSpan = document.createElement('span');
            firstSpan.innerText = slider.initialValue;
            firstSpan.classList.add('sliderValue');
            const secondSpan = document.createElement('span');
            secondSpan.style.backgroundColor = slider.color;
            secondSpan.classList.add('colorSquare');
            const thirdSpan = document.createElement('span');
            thirdSpan.innerText = slider.displayName;
            li.appendChild(firstSpan);
            li.appendChild(secondSpan);
            li.appendChild(thirdSpan);
            display.appendChild(li);
        });

        // Append to DOM
        display.appendChild(heading);
        this.container.appendChild(display);
    }


    /**
     * Redraw active slider
     * 
     * @param {element} activeSlider
     * @param {obj} rmc
     */
    redrawActiveSlider(rmc) {
        const activePath = this.activeSlider.querySelector('.sliderSinglePathActive');
        const radius = +this.activeSlider.getAttribute('rad');
        const currentAngle = this.calculateMouseAngle(rmc) * 0.999;

        // Redraw active path
        activePath.setAttribute('d', this.describeArc(this.cx, this.cy, radius, 0, this.radiansToDegrees(currentAngle)));

        // Redraw handle
        const handle = this.activeSlider.querySelector('.sliderHandle');
        const handleCenter = this.calculateHandleCenter(currentAngle, radius);
        handle.setAttribute('cx', handleCenter.x);
        handle.setAttribute('cy', handleCenter.y);

        // Update legend
        this.updateLegendUI(currentAngle);
    }


    /**
     * Update legend UI
     * 
     * @param {number} currentAngle 
     */
    updateLegendUI(currentAngle) {
        const targetSlider = this.activeSlider.getAttribute('data-slider');
        const targetLegend = document.querySelector(`li[data-slider="${targetSlider}"] .sliderValue`);
        const currentSlider = this.sliders[targetSlider];
        const currentSliderRange = currentSlider.max - currentSlider.min;
        let currentValue = currentAngle / this.tau * currentSliderRange;
        const numOfSteps =  Math.round(currentValue / currentSlider.step);
        currentValue = currentSlider.min + numOfSteps * currentSlider.step;
        targetLegend.innerText = currentValue;
    }


    /**
     * Mouse touch start event
     * 
     * @param {object} e 
     */
    mouseTouchStart (e) {
        if (this.mouseDown) return;
        this.mouseDown = true;
        const rmc = this.getRelativeMouseCoordinates(e);
        const closestSlider = this.findClosestSlider(rmc);
        this.redrawActiveSlider(rmc);
    }

    // get new values for active slider on mouse move or touch move event
    mouseTouchMove(e) {
        if (!this.mouseDown) return;
        e.preventDefault();
        const rmc = this.getRelativeMouseCoordinates(e);
        this.redrawActiveSlider(rmc);
      }


      // deactivate slider on mouse up or touch end event
    mouseTouchEnd() {
        if (!this.mouseDown) return;
        this.mouseDown = false;
        this.activeSlider = null;
        // firstSpan.removeAttribute('class');
      }


    /**
     * Calculate number of arc fractions and space between them
     * 
     * @param {number} circumference 
     * @param {number} arcBgFractionLength 
     * @param {number} arcBgFractionBetweenSpacing 
     * 
     * @return {number} arcFractionSpacing
     */
    calculateSpacingBetweenArcFractions(circumference, arcBgFractionLength, arcBgFractionBetweenSpacing) {
        const numFractions = Math.floor((circumference / arcBgFractionLength) * arcBgFractionBetweenSpacing);
        const totalSpacing = circumference - numFractions * arcBgFractionLength;
        return totalSpacing / numFractions;
    }
  

    /**
     * Describe arc helper functions
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {number} startAngle 
     * @param {number} endAngle 
     */
    describeArc (x, y, radius, startAngle, endAngle) {
        let endAngleOriginal, start, end, arcSweep, path;
        endAngleOriginal = endAngle;

        if(endAngleOriginal - startAngle === 360){
            endAngle = 359;
        }

        start = this.polarToCartesian(x, y, radius, endAngle);
        end = this.polarToCartesian(x, y, radius, startAngle);
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
      

    /**
     * Helper function - polar to cartesian transformation
     * 
     * @param {number} centerX 
     * @param {number} centerY 
     * @param {number} radius 
     * @param {number} angleInDegrees 
     */
     // function polar to cartesian transformation
     polarToCartesian (centerX, centerY, radius, angleInDegrees) {
        let angleInRadians = angleInDegrees * Math.PI / 180;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }


    /**
     * Calculate handle center
     * 
     * @param {number} angle 
     * @param {number} radius 
     */
    calculateHandleCenter (angle, radius) {
        const x = this.cx + Math.cos(angle) * radius;
        const y = this.cy + Math.sin(angle) * radius;
        return {
            'x': x,
            'y': y
        };
    }


    /**
     * Get mouse coordinates relative to the top and left of the container
     *  
     * @param {string} e
     */ 
    getRelativeMouseCoordinates (e) {
        const containerRect = document.querySelector('.slider__data').getBoundingClientRect();
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;
        return { x, y };
    }


    /**
     * Calculate mouse angle in radians
     * 
     * @param {object} rmc 
     */
    calculateMouseAngle(rmc) {
        const angle = Math.atan2(rmc.y - this.cy, rmc.x - this.cx);
        if (angle > - this.tau / 2 && angle < - this.tau / 4) {
            return angle + this.tau * 1.25;
        } else {
            return angle + this.tau * 0.25;
        }
    }


    /**
     * Transform radians to degrees
     * 
     * @param {number} angle 
     */
    radiansToDegrees(angle) {
        return angle / (Math.PI / 180);
    }


    /**
     * 
     * @param {object} e 
     * @param {array} sliders 
     */
    findClosestSlider(rmc) {
        const mouseDistanceFromCenter = Math.hypot(rmc.x - this.cx, rmc.y - this.cy);
        const container = document.querySelector('.slider__data');
        const sliderGroups = Array.from(container.querySelectorAll('g'));

        // Get distances from client coordinates to each slider
        const distances = sliderGroups.map(slider => {
            const rad = parseInt(slider.getAttribute('rad'));
            return Math.min( Math.abs(mouseDistanceFromCenter - rad) );
        });

        // Find closest slider
        const closestSliderIndex = distances.indexOf(Math.min(...distances));
        this.activeSlider = sliderGroups[closestSliderIndex];
    }
}

  
  
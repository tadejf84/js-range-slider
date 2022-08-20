class Slider {

    /**
     * @constructor
     * 
     * @param {string} DOM selector
     * @param {array} sliders
     */
    constructor({ DOMselector, sliders }) {
        this.DOMselector = DOMselector;
        this.container = document.querySelector(this.DOMselector);  // Slider container
        this.sliderWidth = 400;                                     // Slider width
        this.sliderHeight = 400;                                    // Slider length
        this.cx = this.sliderWidth / 2;                             // Slider center X coordinate
        this.cy = this.sliderHeight / 2;                            // Slider center Y coordinate
        this.tau = 2 * Math.PI;                                     // Tau constant
        this.sliders = sliders;                                     // Sliders array with opts for each slider
        this.arcFractionSpacing = 0.85;                             // Spacing between arc fractions
        this.arcFractionLength = 10;                                // Arc fraction length
        this.arcFractionThickness = 25;                             // Arc fraction thickness
        this.arcBgFractionColor = '#D8D8D8';                        // Arc fraction color for background slider
        this.handleFillColor = '#fff';                              // Slider handle fill color
        this.handleStrokeColor = '#888888';                         // Slider handle stroke color
        this.handleStrokeThickness = 3;                             // Slider handle stroke thickness    
        this.mouseDown = false;                                     // Is mouse down
        this.activeSlider = null;                                   // Stores active (selected) slider
    }

    /**
     * Draw sliders on init
     * 
     */
    draw() {

        // Create legend UI
        this.createLegendUI();

        // Create and append SVG holder
        const svgContainer = document.createElement('div');
        svgContainer.classList.add('slider__data');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('height', this.sliderWidth);
        svg.setAttribute('width', this.sliderHeight);
        svgContainer.appendChild(svg);
        this.container.appendChild(svgContainer);

        // Draw sliders
        this.sliders.forEach((slider, index) => this.drawSingleSliderOnInit(svg, slider, index));

        // Event listeners
        svgContainer.addEventListener('mousedown', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('touchstart', this.mouseTouchStart.bind(this), false);
        svgContainer.addEventListener('mousemove', this.mouseTouchMove.bind(this), false);
        svgContainer.addEventListener('touchmove', this.mouseTouchMove.bind(this), false);
        window.addEventListener('mouseup', this.mouseTouchEnd.bind(this), false);
        window.addEventListener('touchend', this.mouseTouchEnd.bind(this), false);
    }

    /**
     * Draw single slider on init
     * 
     * @param {object} svg 
     * @param {object} slider 
     * @param {number} index 
     */
    drawSingleSliderOnInit(svg, slider, index) {

        // Default slider opts, if none are set
        slider.radius = slider.radius ?? 50;
        slider.min = slider.min ?? 0;
        slider.max = slider.max ?? 1000;
        slider.step = slider.step ?? 50;
        slider.initialValue = slider.initialValue ?? 0;
        slider.color = slider.color ?? '#FF5733';

        // Calculate slider circumference
        const circumference = slider.radius * this.tau;

        // Calculate initial angle
        const initialAngle = Math.floor( ( slider.initialValue / (slider.max - slider.min) ) * 360 );

        // Calculate spacing between arc fractions
        const arcFractionSpacing = this.calculateSpacingBetweenArcFractions(circumference, this.arcFractionLength, this.arcFractionSpacing);

        // Create a single slider group - holds all paths and handle
        const sliderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sliderGroup.setAttribute('class', 'sliderSingle');
        sliderGroup.setAttribute('data-slider', index);
        sliderGroup.setAttribute('transform', 'rotate(-90,' + this.cx + ',' + this.cy + ')');
        sliderGroup.setAttribute('rad', slider.radius);
        svg.appendChild(sliderGroup);
        
        // Draw background arc path
        this.drawArcPath(this.arcBgFractionColor, slider.radius, 360, arcFractionSpacing, 'bg', sliderGroup);

        // Draw active arc path
        this.drawArcPath(slider.color, slider.radius, initialAngle, arcFractionSpacing, 'active', sliderGroup);

        // Draw handle
        this.drawHandle(slider, initialAngle, sliderGroup);
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
    drawArcPath( color, radius, angle, singleSpacing, type, group ) {

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
        group.appendChild(path);
    }

    /**
     * Draw handle for single slider
     * 
     * @param {object} slider 
     * @param {number} initialAngle 
     * @param {group} group 
     */
    drawHandle(slider, initialAngle, group) {

        // Calculate handle center
        const handleCenter = this.calculateHandleCenter(initialAngle * this.tau / 360, slider.radius);

        // Draw handle
        const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
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
     * Create legend UI on init
     * 
     */
    createLegendUI() {

        // Create legend
        const display = document.createElement('ul');
        display.classList.add('slider__legend');

        // Legend heading
        const heading = document.createElement('h2');
        heading.innerText = 'Legend';
        display.appendChild(heading);

        // Legend data for all sliders
        this.sliders.forEach((slider, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-slider', index);
            const firstSpan = document.createElement('span');
            firstSpan.style.backgroundColor = slider.color ?? '#FF5733';
            firstSpan.classList.add('colorSquare');
            const secondSpan = document.createElement('span');
            secondSpan.innerText = slider.displayName ?? 'Unnamed value';
            const thirdSpan = document.createElement('span');
            thirdSpan.innerText = slider.initialValue ?? 0;
            thirdSpan.classList.add('sliderValue');
            li.appendChild(firstSpan);
            li.appendChild(secondSpan);
            li.appendChild(thirdSpan);
            display.appendChild(li);
        });

        // Append to DOM
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
     * Mouse down / Touch start event
     * 
     * @param {object} e 
     */
    mouseTouchStart(e) {
        if (this.mouseDown) return;
        this.mouseDown = true;
        const rmc = this.getRelativeMouseOrTouchCoordinates(e);
        this.findClosestSlider(rmc);
        this.redrawActiveSlider(rmc);
    }

    /**
     * Mouse move / touch move event
     * 
     * @param {object} e 
     */
    mouseTouchMove(e) {
        if (!this.mouseDown) return;
        e.preventDefault();
        const rmc = this.getRelativeMouseOrTouchCoordinates(e);
        this.redrawActiveSlider(rmc);
    }

    /**
     * Mouse move / touch move event
     * Deactivate slider
     * 
     */
    mouseTouchEnd() {
        if (!this.mouseDown) return;
        this.mouseDown = false;
        this.activeSlider = null;
    }

    /**
     * Calculate number of arc fractions and space between them
     * 
     * @param {number} circumference 
     * @param {number} arcBgFractionLength 
     * @param {number} arcBgFractionBetweenSpacing 
     * 
     * @returns {number} arcFractionSpacing
     */
    calculateSpacingBetweenArcFractions(circumference, arcBgFractionLength, arcBgFractionBetweenSpacing) {
        const numFractions = Math.floor((circumference / arcBgFractionLength) * arcBgFractionBetweenSpacing);
        const totalSpacing = circumference - numFractions * arcBgFractionLength;
        return totalSpacing / numFractions;
    }

    /**
     * Helper functiom - describe arc
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {number} startAngle 
     * @param {number} endAngle 
     * 
     * @returns {string} path
     */
    describeArc (x, y, radius, startAngle, endAngle) {
        let path,
            endAngleOriginal = endAngle, 
            start, 
            end, 
            arcSweep;

        if(endAngleOriginal - startAngle === 360)
        {
            endAngle = 359;
        }

        start = this.polarToCartesian(x, y, radius, endAngle);
        end = this.polarToCartesian(x, y, radius, startAngle);
        arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

        path = [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y
        ];

        if (endAngleOriginal - startAngle === 360) 
        {
            path.push('z');
        } 

        return path.join(' ');
    }

    /**
     * Helper function - polar to cartesian transformation
     * 
     * @param {number} centerX 
     * @param {number} centerY 
     * @param {number} radius 
     * @param {number} angleInDegrees 
     * 
     * @returns {object} coords
     */
     polarToCartesian (centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = angleInDegrees * Math.PI / 180;
        const x = centerX + (radius * Math.cos(angleInRadians));
        const y = centerY + (radius * Math.sin(angleInRadians));
        return { x, y };
    }

    /**
     * Helper function - calculate handle center
     * 
     * @param {number} angle 
     * @param {number} radius
     * 
     * @returns {object} coords 
     */
    calculateHandleCenter (angle, radius) {
        const x = this.cx + Math.cos(angle) * radius;
        const y = this.cy + Math.sin(angle) * radius;
        return { x, y };
    }

    /**
     * Get mouse/touch coordinates relative to the top and left of the container
     *  
     * @param {object} e
     * 
     * @returns {object} coords
     */ 
    getRelativeMouseOrTouchCoordinates (e) {
        const containerRect = document.querySelector('.slider__data').getBoundingClientRect();
        let x, 
            y, 
            clientPosX, 
            clientPosY;
 
        // Touch Event triggered
        if (window.TouchEvent && e instanceof TouchEvent) 
        {
            clientPosX = e.touches[0].pageX;
            clientPosY = e.touches[0].pageY;
        }
        // Mouse Event Triggered
        else 
        {
            clientPosX = e.clientX;
            clientPosY = e.clientY;
        }

        // Get Relative Position
        x = clientPosX - containerRect.left;
        y = clientPosY - containerRect.top;

        return { x, y };
    }

    /**
     * Calculate mouse angle in radians
     * 
     * @param {object} rmc 
     * 
     * @returns {number} angle
     */
    calculateMouseAngle(rmc) {
        const angle = Math.atan2(rmc.y - this.cy, rmc.x - this.cx);

        if (angle > - this.tau / 2 && angle < - this.tau / 4) 
        {
            return angle + this.tau * 1.25;
        } 
        else 
        {
            return angle + this.tau * 0.25;
        }
    }

    /**
     * Helper function - transform radians to degrees
     * 
     * @param {number} angle 
     * 
     * @returns {number} angle
     */
    radiansToDegrees(angle) {
        return angle / (Math.PI / 180);
    }

    /**
     * Find closest slider to mouse pointer
     * Activate the slider
     * 
     * @param {object} rmc
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

  
  
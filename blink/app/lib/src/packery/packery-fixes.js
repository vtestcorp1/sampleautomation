/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/*
 To achieve horizontal packing instead of vertical when elements
 are dragged, we use a method already present in the packery library.
 */
Packery.prototype._getPackMethod = function() {
    return 'pack';
};


//2-finger touch to drag.
Unipointer.prototype.ontouchstart = function( event ) {
    if (event.touches.length != 2) {
        return;
    }
    this._pointerDown( event /*event object*/,
        event.changedTouches[0] /* the pointer object inside event */);
};

Unipointer.getPointerPoint = function( pointer , container) {
    /*
        This method returns the current coords of the pointer.
        We add a scroll adjustment to the point if a container is supplied.
     */
    var scrollAdjustment = 0;
    if(container) {
        scrollAdjustment = container.scrollTop() - container.offset().top;
    }
    return {
        x: pointer.pageX,
        y: pointer.pageY + scrollAdjustment
    };
};

/**
 * This method is called when a user mousedowns or touches to start the drag
 * operation. 'pointerDownPoint' stores the initial point where the drag started on an item.
**/
Unidragger.prototype._dragPointerDown = function( event, pointer ) {
    // track to see when dragging starts
    this.pointerDownPoint = Unipointer.getPointerPoint( pointer, this.options.scrollContainer );

    var canPreventDefault = this.canPreventDefaultOnPointerDown( event, pointer );
    if ( canPreventDefault ) {
        event.preventDefault();
    }
    this.windowHeight = $(window).height();
    this.maxScroll =
        this.options.scrollContainer[0].scrollHeight - this.options.scrollContainer.height();
};

/**
 * This method is called on each pointer movement after a drag operation is deemed to have
 * started. We add the scroll correction here.
 * @param event
 * @param pointer
 * @returns {{x: number, y: number}}
 * @private
 */
Unidragger.prototype._dragPointerMove = function( event, pointer ) {
    var movePoint = Unipointer.getPointerPoint( pointer, this.options.scrollContainer );
    var moveVector = {
        x: movePoint.x - this.pointerDownPoint.x,
        y: movePoint.y - this.pointerDownPoint.y
    };
    // start drag if pointer has moved far enough to start drag
    if ( !this.isDragging && this.hasDragStarted( moveVector ) ) {
        this._dragStart( event, pointer );
    }
    return moveVector;
};

/**
 * We have added these two additional options which can be passed into
 * draggabilly.
 * @type {{autoScrollThreshold: number, scrollContainer: (any)}}
 */
Draggabilly.defaults = {
    autoScrollThreshold: 0,
    scrollContainer: $(window)
};

Draggabilly.applyGrid = function applyGrid( value, grid, method ) {
    method = method || 'round';
    return grid ? Math[ method ]( value / grid ) * grid : value;
};

Draggabilly.prototype.dragMove = function( event, pointer, moveVector ) {
    if ( !this.isEnabled ) {
        return;
    }
    var dragX = moveVector.x;
    var dragY = moveVector.y;

    var grid = this.options.grid;
    var gridX = grid && grid[0];
    var gridY = grid && grid[1];

    dragX = Draggabilly.applyGrid( dragX, gridX );
    dragY = Draggabilly.applyGrid( dragY, gridY );

    dragX = this.containDrag( 'x', dragX, gridX );
    dragY = this.containDrag( 'y', dragY, gridY );

    // constrain to axis
    dragX = this.options.axis == 'y' ? 0 : dragX;
    dragY = this.options.axis == 'x' ? 0 : dragY;

    // set dragPoint properties
    this.dragPoint.x = dragX;
    this.dragPoint.y = dragY;

    /*
        On every dragMovement we check if the pointer is within the thresholds where
        we want to begin autoscrolling. If yes, we assign a scroll speed depending on
        the pointer position. There are two things to scroll speed, direction(+/-) and
        magnitude which is greater when pointer is too far out of the window and vice versa.
     */
    if(pointer.clientY > this.windowHeight - this.options.autoScrollThreshold) {
        this.scrollSpeed =
            (this.options.autoScrollThreshold + pointer.clientY - this.windowHeight) / 3;
    } else if(pointer.clientY < this.options.autoScrollThreshold) {
        this.scrollSpeed = -(this.options.autoScrollThreshold - pointer.clientY) / 3;
    } else {
        this.scrollSpeed = 0;
    }

    this.setPositions();
    this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
};

Draggabilly.prototype.setPositions = function() {
    this.position.y = this.startPosition.y + this.dragPoint.y;
    this.position.x = this.startPosition.x + this.dragPoint.x;
};

/**
 * This is a recursive method which gets continuously called via the recursive callback.
 * On each execution it is responsible for rendering the new position of the div.
 */
Draggabilly.prototype.animate = function() {
    // only render and animate if dragging
    if ( !this.isDragging ) {
        return;
    }

    this.autoScroll(); // Calling autoScroll on each recursive cycle.
    this.positionDrag();

    var _this = this;
    requestAnimationFrame( function animateFrame() {
        _this.animate();
    });

};

/**
 * This is a new method which we have added to dragabilly. It checks the scroll speed
 * to determine if auto scrolling is necessary. If yes, it scroll the scrollContainer
 * by that amount.
 */
Draggabilly.prototype.autoScroll = function() {
    if(!this.scrollSpeed) {
        return;
    }
    var scrollTop = this.options.scrollContainer.scrollTop();
    var newScrollTop = scrollTop + this.scrollSpeed;
    if(newScrollTop > 0 && newScrollTop < this.maxScroll) {
        this.dragPoint.y += this.scrollSpeed;
        this.options.scrollContainer.scrollTop(newScrollTop);
    }
};

Draggabilly.transformProperty = typeof document.documentElement.style.transform == 'string' ?
    'transform' : 'WebkitTransform';

/**
 * This method positions the element using CSS transforms. Called on each animate
 * cycle.
 */
Draggabilly.prototype.positionDrag = function() {
    this.setPositions();
    this.element.style[ Draggabilly.transformProperty ] = 'translate3d( ' + this.dragPoint.x +
        'px, ' + this.dragPoint.y + 'px, 0)';
};


// SCAL-16096, we need to discard click that originates
// from the scroll bar on IE 11
function Rectangle () {
    this.top = 0;
    this.left = 0;
    this.bottom = 0;
    this.right = 0;

}

Rectangle.prototype.hasPoint = function(x, y) {
    return (y >= this.top && y <= this.bottom) &&
        (x >= this.left && x <= this.right);
};

// we wrap the origina _pointerDown
Unipointer.prototype.originalPointerDown = Unipointer.prototype._pointerDown;

/**
 *
 * @override
 * @param event
 * @param pointer
 * @private
 */
Unipointer.prototype._pointerDown = function(event, pointer) {

    if (Unipointer.inScrollRange(event)) {
        return;
    }
    this.originalPointerDown(event, pointer);
}

// we lazy-load the width of the scroll bar
// http://stackoverflow.com/questions/13382516
Unipointer.getScrollBarWidth = function() {

    if (!Unipointer.scrollBarWidth) {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
        document.body.appendChild(outer);
        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);
        var widthWithScroll = inner.offsetWidth;
        // remove div
        outer.parentNode.removeChild(outer);
        Unipointer.scrollBarWidth = widthNoScroll - widthWithScroll;
    }

   return Unipointer.scrollBarWidth
};

Unipointer.hasScroll = function(element, axis) {

    var overflow = element.css('overflow'),
        overflowAxis,
        bShouldScroll;

    if (typeof axis == 'undefined' || axis == 'y') {
        overflowAxis = element.css('overflow-y');
    } else {
        overflowAxis = element.css('overflow-x');
    }


    if (typeof axis == 'undefined' || axis == 'y') {
        bShouldScroll = element.get(0).scrollHeight > element.innerHeight();
    } else {
        bShouldScroll = element.get(0).scrollWidth > element.innerWidth();
    }

    var bAllowedScroll = (overflow == 'auto' || overflow == 'visible') ||
        (overflowAxis == 'auto' || overflowAxis == 'visible');
    var bOverrideScroll = overflow == 'scroll' || overflowAxis == 'scroll';

    return (bShouldScroll && bAllowedScroll) || bOverrideScroll;
};

// taken from http://jsfiddle.net/aKejW/
Unipointer.inScrollRange = function(event) {

    var scrollSize = Unipointer.getScrollBarWidth();
    var x = event.pageX,
        y = event.pageY,
        e = $(event.target);

    var hasYScrollBar = Unipointer.hasScroll(e),
        hasXScrollBar = Unipointer.hasScroll(e, 'x');

    var rX = null,
        rY = null,
        bInX = false,
        bInY = false;

    if (hasYScrollBar) {
        rY = new Rectangle();
        rY.top = e.offset().top;
        rY.right = e.offset().left + e.width();
        rY.bottom = rY.top + e.height();
        rY.left = rY.right - scrollSize;
        bInY = rY.hasPoint(x, y);
    }

    if (hasXScrollBar) {
        rX = new Rectangle();
        rX.bottom = e.offset().top + e.height();
        rX.left = e.offset().left;
        rX.top = rX.bottom - scrollSize;
        rX.right = rX.left + e.width();
        bInX = rX.hasPoint(x, y);
    }
    return bInX || bInY;
}



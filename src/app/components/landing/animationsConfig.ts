import {easeIn, easeOut, easeInOutQuart, easeInOutSine} from '_shared/animations';
export const slowLeftEnter = {
  params: {
    offset: '300%', duration: '4s', delay: '500ms', easing: easeInOutQuart
  }
};
export const slowRightEnter = {
  params: {
    offset: '-300%', duration: '4s', delay: '500ms', easing: easeInOutQuart
  }
};

export const topEnterLeaveBottom = {
  enter: {
    params: {
      offset: '-300%', duration: '1s', delay: '300ms', easing: easeIn
    }
  },
  leave: {
    params: {
      offset: '300%', duration: '0.5s', delay: '', easing: easeOut
    }
  }
};

export const bottomEnterLeaveTop = {
  enter: {
    params: {
      offset: '300%', duration: '1.3s', delay: '', easing: easeOut
    }
  },
  leave: {
    params: {
      offset: '-300%', duration: '1.3s', delay: '600ms', easing: easeIn
    }
  }
};

export const leftEnterLeaveRight = {
  enter: {
    params: {
      offset: '-300%', duration: '1s', delay: '300ms', easing: easeIn
    }
  },
  leave: {
    params: {
      offset: '300%', duration: '0.5s', delay: '0', easing: easeOut
    }
  },
};

export const rightEnterLeaveLeft = {
  enter: {
    params: {
      offset: '300%', duration: '1s', delay: '300ms', easing: easeOut
    }
  },
  leave: {
    params: {
      offset: '-300%', duration: '0.5s', delay: '0', easing: easeIn
    }
  },
};

export const movieCreditsSlideConfig = {
  params: {
    opacity: '1',
    enterLeaveOffset: '200%',
    showOffset: '5%',
    enterDuration: '400ms',
    showDuration: '3000ms',
    leaveDuration: '400ms',
    easing: easeInOutSine,
  }
};

export const rightToLeftSlideAndScrollConfig = {
  params: {
    enterDuration: '2s',
    enterDelay: '3s',
    easing: easeInOutSine,
    offsetEnter: '200%',
    scrollDuration: '3.7s',
    scrollOffset: '-35%',
  }
};

export const leftToRightSlideAndSlowScrollConfig = {
  params: {
    enterDuration: '2s',
    enterDelay: '3.2s',
    easing: easeInOutSine,
    offsetEnter: '-200%',
    offsetAfterEnter: '-20%',
    scrollDuration: '3.7s',
    scrollOffset: '0%',
  }
};

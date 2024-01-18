import {
  animation, trigger, animateChild, group,
  transition, animate, style, query
} from '@angular/animations';

export const horizontalSlide = animation([
  style({
    transform: 'translate3d( {{ offset }}, 0, 0)'
  }),
  animate(
    '{{ duration }} {{ delay }} {{ easing }}'
    )
],
{
  params: {
    offset: '100%',
    duration: '1s',
    delay: '0',
    easing: 'ease-out'
  }
});

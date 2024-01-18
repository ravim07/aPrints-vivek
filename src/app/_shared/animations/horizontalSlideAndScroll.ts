import {
  animation, trigger, animateChild, group,
  transition, animate, style, query, stagger
} from '@angular/animations';
import { easeInOutSine } from './easings';

export const horizontalSlideAndScroll = animation(
[
  query(':self', [
    style({transform: 'translate3d({{offsetEnter}}, 0, 0)'}),
    stagger('100ms', [
      animate('{{enterDuration}} {{enterDelay}} {{easing}}', style({ transform: 'translate3d({{offsetAfterEnter}}, 0, 0)' })),
      animate('{{scrollDuration}} {{easing}}', style({ transform: 'translate3d({{scrollOffset}}, 0, 0)' })),
    ])
  ])
],
{
  params: {
    enterDuration: '2s',
    enterDelay: '3s',
    easing: easeInOutSine,
    offsetEnter: '200%',
    offsetAfterEnter: '0',
    scrollDuration: '1s',
    scrollOffset: '-55%',
  }
});

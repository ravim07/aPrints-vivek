import {
  animation, trigger, animateChild, group,
  transition, animate, style, query, stagger
} from '@angular/animations';
import { easeInOutSine } from './easings';

export const movieCreditsSlideFromBottomToTop = animation(
[
  query(':self', [
    style({transform: 'translate3d(0, {{enterLeaveOffset}}, 0)'}),
    stagger('200ms', [
      animate(
        '{{enterDuration}} {{enterDelay}} {{easing}}',
        style({
          transform: 'translate3d(0, {{showOffset}}, 0)',
          opacity: '{{opacity}}'
      })),
      animate(
        '{{showDuration}} {{showDelay}} {{easing}}',
        style({
          transform: 'translate3d(0, -{{showOffset}}, 0)',
          opacity: '{{opacity}}'})),
      animate(
        '{{leaveDuration}} {{leaveDelay}} {{easing}}',
        style({
          transform: 'translate3d(0, -{{enterLeaveOffset}}, 0)',
          opacity: '{{opacity}}'
      }))
    ]),
  ])
],
{
  params: {
    opacity: '1',
    enterLeaveOffset: '200%',
    showOffset: '5%',
    enterDuration: '500ms',
    enterDelay: '',
    showDuration: '2500ms',
    showDelay: '',
    leaveDuration: '500ms',
    leaveDelay: '',
    easing: easeInOutSine,
  }
});

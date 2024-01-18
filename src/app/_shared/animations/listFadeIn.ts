import {
  animation, trigger, animateChild, group,
  transition, animate, style, query, stagger
} from '@angular/animations';
import { easeInOutSine } from './easings';

export const listFadeIn = animation(
[
  query('div:nth-child(1), div:nth-child(2), div:nth-child(3), div:nth-last-child(1), div:nth-last-child(2), div:nth-last-child(3)', [
    style({opacity: 0}),
    stagger('0.5s', [
      style({opacity: 0}),
      animate(`{{duration}} {{delay}} {{easing}}`, style({opacity: '{{opacity}}'})),
    ]),
    style({opacity: 1}),
  ])
],
{
  params: {
    opacity: '1',
    duration: '1s',
    delay: '1.5s',
    easing: easeInOutSine,
  }
});

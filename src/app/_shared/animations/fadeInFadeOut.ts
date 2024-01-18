import { animation, animate, style } from '@angular/animations';
import { easeInOutSine } from './easings';

export const fadeIn = animation([
  style({opacity: 0}),
  animate(`{{duration}} {{delay}} {{easing}}`, style({opacity: '{{opacity}}'})),
],
{
  params: {
    opacity: '1',
    duration: '1s',
    delay: '1.5s',
    easing: easeInOutSine,
  }
});

export const fadeOut = animation([
  style({opacity: 1}),
  animate(`{{duration}} {{delay}} {{easing}}`, style({opacity: '{{opacity}}'})),
],
{
  params: {
    opacity: '0',
    duration: '1s',
    delay: '1.5s',
    easing: easeInOutSine,
  }
});

import {
  animation, trigger, animateChild, group,
  transition, animate, style, query
} from '@angular/animations';

export const verticalSlideFromSide = animation([
  style({ transform: 'translate3d(0, {{ offset }}, 0)' }),
  animate('{{ duration }} {{ delay }} {{ easing }}')
],
{
  params: {
    offset: '100%',
    duration: '1s',
    delay: '0',
    easing: 'ease-out'
  }
});

export const verticalSlideToSide = animation([
  animate('{{ duration }} {{ delay }} {{ easing }}'),
  style({ transform: 'translate3d(0, {{ offset }}, 0)' })
],
{
  params: {
    offset: '100%',
    duration: '1s',
    delay: '0',
    easing: 'ease-out'
  }
});

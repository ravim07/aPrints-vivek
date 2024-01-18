'use strict';

/*
 * Complete the 'moves' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts INTEGER_ARRAY arr as parameter.
 */
function moves(arr) {
  let moves = 0;
  const arrayLength = arr.length;
  const swappedArray = [];
  let midIndex = Math.ceil(arrayLength / 2);
  let lastSwapIndex = midIndex;
  for (let i = 0; i < midIndex; i++) {
    if (arr[i] % 2 === 1 && !swappedArray.includes(i)) {
      for (let j = lastSwapIndex; j < arrayLength; j++) {
        if(arr[j] % 2 === 0) {
          const tempValue = arr[i];
          arr[i] = arr[j];
          arr[j] = tempValue;
          swappedArray.push(j);
          lastSwapIndex = j;
        }
      }
      moves++;
    }
  }
  return moves;
}

function main() {
  const result = moves([8,11,4,21]);
}

main();

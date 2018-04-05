import {getWeightedPulse, getHours, getEstimatedScore, getActualScore} from './workup-set-summary';

function getSummary(dataArray) {
  let result = {
    count: null,
    duration: null,
    averagePulse: null,
    estimatedScore: null,
    actualScore: null,
  };

  if (dataArray.length === 0) {
    return result;
  }

  result.duration = 0;
  result.estimatedScore = 0;
  result.actualScore = 0;

  let weightedPulse = 0;

  dataArray.forEach(function(element) {
    if (element.duration) {
      result.duration = result.duration + element.duration;
    }

    if (element.duration && element.pulse) {
      weightedPulse = weightedPulse + getWeightedPulse(getHours(element.duration), element.pulse);
      result.actualScore = result.actualScore + getActualScore(element.duration, element.pulse);
    }

    if (element.duration && element.scoreDencity) {
      result.estimatedScore = result.estimatedScore + getEstimatedScore(element.duration, element.scoreDencity);
    }
  }, this);

  result.count = dataArray.length;
  result.averagePulse = Math.round(weightedPulse / getHours(result.duration));

  return result;
}

export {getSummary};

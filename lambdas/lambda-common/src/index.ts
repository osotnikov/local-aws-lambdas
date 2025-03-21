import * as ss from 'simple-statistics'

export function customLog(log: any): void {
  const m = ss.max([1,2,3,4,5,123])
  console.log(log + m);
}

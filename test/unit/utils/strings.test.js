import { trimString } from '../../../src/utils/strings';

test('successfully trim long strings', done => {
  [
    ['foo bar', 'foo bar'],
    ['DeskproApps/github/tree/master', 'DeskproApps/githu...']
  ].forEach((data) => {
    expect(trimString(data[0], 20)).toEqual(data[1]);
  });

  done();
});

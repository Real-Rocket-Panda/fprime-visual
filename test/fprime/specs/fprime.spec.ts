import m from 'fprime';
import { expect } from 'chai';

describe('Greetings', () => {
  it('should return greeting message', () => {
    expect(m.hello).to.eq('Greetings! Electron + Vue + Typescript');
  });
});

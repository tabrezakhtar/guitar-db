import React from 'react';
import { shallow } from 'enzyme';
import Colour from './colour';

describe('when the component loads', () => {
  test('displays a colour block', () => {
    const wrapper = shallow(<Colour id="testId" bgColour="red" />);
  
    expect(wrapper.containsMatchingElement(
      <div className="colour red" title="red">
        <label htmlFor="testId">
          <input type="checkbox" id="testId" name="testId" className="visually-hidden"/>
          <img src="/tick.svg" alt="tick"/>
        </label>
      </div>
    )).toEqual(true);
  });
});

describe('when the component is toggled', () => {
  test('it hides the tick image', () => {
    const wrapper = shallow(<Colour id="testId" bgColour="red" checked={false}/>);
  
    expect(wrapper.containsMatchingElement(
      <div className="colour red" title="red">
        <label htmlFor="testId">
          <input type="checkbox" id="testId" name="testId" className="visually-hidden"/>
          <img src="/tick.svg" alt="tick" className="hide"/>
        </label>
      </div>
    )).toEqual(true);
  });
});

describe('when the component is clicked', () => {
  test('it hides the tick image', () => {
    const colourSelectedStub = jest.fn();
    const wrapper = shallow(<Colour id="testId" bgColour="red" onColourSelected={colourSelectedStub}/>);
    wrapper.find('#testId').simulate('change');
    expect(colourSelectedStub).toBeCalledWith('red', true);
  });
});
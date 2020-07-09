import React from 'react';
import { shallow } from 'enzyme';
import Shapes from './shapes';
import ShapesEnum from '../shapes-enum';
import FilterTypes from '../filter-types';
import { updateFilter, RESET_FILTER } from '../actions/filtersActions'

describe('when the component is loads', () => {
  test('it renders the guitar shapes', () => {
    const wrapper = shallow(<Shapes.WrappedComponent />);
  
    expect(wrapper.containsMatchingElement(
      <React.Fragment>
        <span className="sidebar__category">
          view by shape
        </span>

        <div className="sidebar__shapes">

          <input defaultChecked type="radio" id="radioAll" name="guitarsShapes" value={ShapesEnum.ALL}/>
          <label className="labelAll" for="radioAll">
            <div>All</div>
          </label> 

          <input type="radio" id="radioSingleCut" name="guitarsShapes" value={ShapesEnum.SINGLE_CUT}/>
          <label for="radioSingleCut">
            <img src="/singlecut_outline.png" alt="Single Cut Guitars"/>
          </label>

          <input type="radio" id="radioSType" name="guitarsShapes" value={ShapesEnum.S_TYPE}/>
          <label for="radioSType">
            <img src="/stype_outline.png" alt="S-Type Guitars"/>
          </label>

          <input type="radio" id="radioTType" name="guitarsShapes" value={ShapesEnum.T_TYPE}/>
          <label for="radioTType">
            <img src="/ttype_outline.png" alt="T-Type Guitars"/>
          </label> 

          <input type="radio" id="radioVType" name="guitarsShapes"value={ShapesEnum.V_TYPE}/>
          <label for="radioVType">
            <img src="/v_outline.png" alt="V-Type Guitars"/>
          </label> 
        </div>
      </React.Fragment>
    )).toEqual(true);
  });
});

describe('when the shapes are clicked', () => {
  test('the ALL button is clicked', () => {
    const dispatchStub = jest.fn();
    const wrapper = shallow(<Shapes.WrappedComponent dispatch={dispatchStub}/>);
    wrapper.find('#radioAll').simulate('click');
    expect(dispatchStub).toBeCalledWith(updateFilter(RESET_FILTER, FilterTypes.SHAPE));
  });

  test('the SINGLE CUT button is clicked', () => {
  });

  test('the STYPE button is clicked', () => {
  });

  test('the TTYPE button is clicked', () => {
  });

  test('the VTYPE button is clicked', () => {
  });
});
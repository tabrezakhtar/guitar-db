import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import EmptyTile from './empty-tile';

describe('snapshot', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<EmptyTile times={5} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('when the empty tiles are rendered', () => {
  test('it displays 3 tiles', () => {
    const wrapper = shallow(<EmptyTile times={3} />);

    expect(wrapper.containsMatchingElement(
      <React.Fragment>
        <li className="tile empty" />
        <li className="tile empty" />
        <li className="tile empty" />
      </React.Fragment>
    )).toEqual(true);
  });
});
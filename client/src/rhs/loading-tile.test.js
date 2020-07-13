import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import LoadingTile from './loading-tile';

describe('snapshot', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<LoadingTile times={5} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('when the loading tiles are rendered', () => {
  test('it displays 3 tiles', () => {
    const wrapper = shallow(<LoadingTile times={3} />);

    expect(wrapper.containsMatchingElement(
      <React.Fragment>
        <li className="tile tile__loading">
          <span className="like" />
          <img src={'/tail-spin.svg'} alt={'loading...'}/>
          <span className="title" />
          <span className="description" />
        </li>
        <li className="tile tile__loading">
          <span className="like" />
          <img src={'/tail-spin.svg'} alt={'loading...'}/>
          <span className="title" />
          <span className="description" />
        </li>
        <li className="tile tile__loading">
          <span className="like" />
          <img src={'/tail-spin.svg'} alt={'loading...'}/>
          <span className="title" />
          <span className="description" />
        </li>
      </React.Fragment>
    )).toEqual(true);
  });
});
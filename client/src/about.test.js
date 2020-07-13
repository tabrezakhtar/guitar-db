import React from 'react';
import About from './about';
import renderer from "react-test-renderer";

describe('about snapshot', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<About />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
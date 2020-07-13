import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom'
import App from './app';
import Menu from './menu';
import Hamburger from './menu/hamburger.js';
import About from "./about";
import Tiles from './rhs';
import SideBar from './sidebar';

describe('when the component loads', () => {
  test('displays the header', () => {
    const wrapper = shallow(<App.WrappedComponent guitarList={[]} loading={true} />);

    expect(wrapper.containsMatchingElement(
      <header className="header">
        <div className="header__logo-box">
          <NavLink to='/'><span>Guitar Explorer<span role="img" aria-label="logo fire">🔥</span></span></NavLink>
        </div>

        <Hamburger />
        <Menu />

      </header>
    )).toEqual(true);
  });

  test('displays the main container', () => {
    const wrapper = shallow(<App.WrappedComponent guitarList={[]} loading={true} />);

    expect(wrapper.containsMatchingElement(
      <div className="container">

        <SideBar />

        <div className="rhs">
          <Switch>
            <Route exact path='/'>
              <Tiles guitars={[]} loading={true}/>
            </Route>

            <Route exact path='/about' component={About}/>
          </Switch>

        </div>
      </div>
    )).toEqual(true);
  });
});
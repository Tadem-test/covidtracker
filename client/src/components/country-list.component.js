import React, { Component } from 'react';
import axios from 'axios';

const Country = props => (
  <tr>
    <td>{props.countryname}</td>
  </tr>
)

export default class CountryList extends Component {
  constructor(props) {
    super(props);

    this.state = {countries: []};
  }

  componentDidMount() {
    axios.get('http://localhost:5000/api/country')
      .then(response => {
        this.setState({ countries: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  countryList() {
    return this.state.countries.map(function(cdata, index) {
      return <Country countryname={cdata.Country} key={index}/>;
    })
  }

  render() {
    return (
      <div>
        <h3>Country List</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            { this.countryList() }
          </tbody>
        </table>
      </div>
    )
  }
}
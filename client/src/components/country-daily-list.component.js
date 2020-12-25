import React, { Component } from 'react';
import axios from 'axios';

const DailyData = props => (
  <tr>
    <td>{props.newcases}</td>
    <td>{props.cases}</td>
    <td>{props.newdeaths}</td>
    <td>{props.deaths}</td>
  </tr>
)

export default class CountryDailyList extends Component {
  constructor(props) {
    super(props);

    this.onChangeCountry = this.onChangeCountry.bind(this);

    this.state = {today: [],countrynames: [], countryname: ''};
  }

  componentDidMount() {
    axios.get(`http://localhost:5000/api/${this.state.countryname}`)
      .then(response => {
        this.setState({ today: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
      axios.get('http://localhost:5000/api/country')
      .then(response => {
        this.setState({ countrynames: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  onChangeCountry(e) {
    this.setState({
      countryname: e.target.value
    })
  }

  countryDailyList() {
    return this.state.today.map(function(cdata, index) {
      return <DailyData newcases={cdata.New_cases} cases={cdata.Cumulative_cases} newdeaths={cdata.New_deaths} deaths={cdata.Cumulative_deaths} key={index}/>;
    })
  }

  onSubmit(e) {
    
  }

  render() {
    return (
      <div>

        <h3>Country List</h3>
        <form onSubmit={this.onSubmit}>
            <select ref="countryInput"
            required
            className="form-control"
            value={this.state.countryname}
            onChange={this.onChangeCountry}>
            {
              this.state.countrynames.map(function(c) {
                return <option 
                  key={c}
                  value={c}>{c}
                  </option>;
              })
            }
            </select>
        </form>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>New Cases</th>
              <th>Cumulative Cases</th>
              <th>New Deaths</th>
              <th>Cumulative Deaths</th>
            </tr>
          </thead>
          <tbody>
            { this.countryDailyList() }
          </tbody>
        </table>
      </div>
    )
  }
}
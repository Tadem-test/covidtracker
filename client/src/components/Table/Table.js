import React from 'react';
import numeral from 'numeral';
import './Table.css';

function Table({ countries }) {
    return (
        <div className="table">
            {countries.map(({Country, Cumulative_cases}) => (
               <tr>
                   <td>{Country}</td>
                   <td><strong>{numeral(Cumulative_cases).format("0,0")}</strong></td>
               </tr> 
            ))}
        </div>
    );
}

export default Table;

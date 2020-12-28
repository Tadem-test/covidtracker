import React from 'react';
import './Table.css';

function Table({ countries }) {
    return (
        <div className="table">
            {countries.map(({Country, Cumulative_cases}) => (
               <tr>
                   <td>{Country}</td>
                   <td><strong>{Cumulative_cases}</strong></td>
               </tr> 
            ))}
        </div>
    );
}

export default Table;

import React from 'react';
import numeral from 'numeral';
import './Table.css';

function Table({ countries }) {
    return (
        <div className="table">
            {countries.map(({Country, Cases}) => (
               <tr>
                   <td>{Country}</td>
                   <td><strong>{numeral(Cases).format("0,0")}</strong></td>
               </tr> 
            ))}
        </div>
    );
}

export default Table;

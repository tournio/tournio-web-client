import PartnerSelectionRow from "./PartnerSelectionRow";

import classes from './DoublesPartners.module.scss';
import React from "react";

const DoublesPartners = ({bowlers = [], onPartnersChosen}) => {
  if (!bowlers || bowlers.length < 2) {
    return '';
  }

  return (
    <div className={`table-responsive ${classes.DoublesPartners}`}>
      <table className={'table table-hover caption-top align-middle'}>
        <thead>
        <tr>
          <th scope={'col'}>
            Bowler
          </th>
          <th colSpan={3} scope={'col'}>
            Partner options
          </th>
        </tr>
        </thead>
        <tbody>
        {bowlers.map((bowler, i) => {
          return <PartnerSelectionRow key={`row_${i}`}
                                      bowler={bowler}
                                      bowlerIndex={i}
                                      teammates={bowlers}
                                      onPartnerSelected={onPartnersChosen}/>
        })}
        </tbody>
      </table>
    </div>
  );
}

export default DoublesPartners;

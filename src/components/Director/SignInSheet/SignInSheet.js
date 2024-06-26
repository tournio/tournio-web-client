import classes from './SignInSheet.module.scss';

const SignInSheet = ({bowler, tournament, showPrintButton}) => {
  if (!bowler || !tournament) {
    return '';
  }

  const countsByItemID = {};
  if (bowler.purchases) {
    bowler.purchases.forEach(p => {
      const piId = p.purchasableItem.identifier;
      if (!countsByItemID[piId]) {
        countsByItemID[piId] = 0;
      }
      countsByItemID[piId] += 1;
    });
  }

  const ledgerRows = [];
  const entryFeeItem = tournament.purchasableItems.find(pi => pi.determination === 'entry_fee');
  if (entryFeeItem) {
    const purchase = bowler.purchases.find(p => p.purchasableItem.identifier === entryFeeItem.identifier);

    ledgerRows.push(
      <tr className={``} key={entryFeeItem.identifier}>
        <td className={``}>
          {entryFeeItem.name}
          {bowler.freeEntry && (
            <p className={`ps-1 mb-0 fst-italic small`}>
              Free entry: {bowler.freeEntry.uniqueCode}
            </p>
          )}
        </td>
        <td className={`${classes.AmountBox} ${classes.PaidAmount} text-center`}>
          ${entryFeeItem.value}
        </td>
        <td className={`text-center`}>
          <i className={`bi ${!!purchase ? 'bi-check-lg' : 'bi-dash-lg' }`}/>
        </td>
      </tr>
    );
  }
  const discountItem = tournament.purchasableItems.find(pi => pi.determination === 'early_discount');
  if (discountItem) {
    const purchase = bowler.purchases.find(p => p.purchasableItem.identifier === discountItem.identifier);

    ledgerRows.push(
      <tr className={``} key={discountItem.identifier}>
        <td className={``}>
          {discountItem.name}
        </td>
        <td className={`${classes.AmountBox} ${classes.PaidAmount} text-center`}>
          &ndash;${discountItem.value}
        </td>
        <td className={`text-center`}>
          <i className={`bi ${!!purchase ? 'bi-check-lg' : 'bi-dash-lg'}`}/>
        </td>
      </tr>
    );
  }
  const lateFeeItem = tournament.purchasableItems.find(pi => pi.determination === 'late_fee');
  if (lateFeeItem) {
    const purchase = bowler.purchases.find(p => p.purchasableItem.identifier === lateFeeItem.identifier);

    ledgerRows.push(
      <tr className={``} key={lateFeeItem.identifier}>
        <td className={``}>
          {lateFeeItem.name}
        </td>
        <td className={`${classes.AmountBox} ${classes.PaidAmount} text-center`}>
          ${lateFeeItem.value}
        </td>
        <td className={`text-center`}>
          <i className={`bi ${!!purchase ? 'bi-check-lg' : 'bi-dash-lg'}`}/>
        </td>
      </tr>
    );

  }

  const tournamentHasExtras = tournament.purchasableItems.some(pi => pi.category === 'bowling');

  const prePurchaseRows = [];
  {
    tournament.purchasableItems.filter(pi => pi.category !== 'bowling' && pi.category !== 'ledger').forEach(pi => {
    // only if the bowler has a purchase for this PI
    const purchase = bowler.purchases.find(p => p.purchasableItem.identifier === pi.identifier);
    if (!purchase) {
      return;
    }

    prePurchaseRows.push (
      <tr className={``} key={pi.identifier}>
        <td className={``}>
          <p className={`mb-0`}>
            {pi.name}
          </p>
        </td>
        <td className={`text-center pe-1`}>
          ${pi.value}
        </td>

        <td className={`text-center ${classes.QuantityBox}`}>
          <i className={`bi bi-x`}/>
          {' '}{countsByItemID[pi.identifier]}
        </td>
        <td className={`text-center ${classes.AmountBox} ${classes.PaidAmount}`}>
          ${pi.value * countsByItemID[pi.identifier]}
        </td>
      </tr>
    );
  })}

  const multiUseBowlingItems = tournament.purchasableItems.filter(pi => pi.category === 'bowling' && pi.determination === 'multi_use');

  return (
    <div className={`${classes.SignInSheetHtml} d-flex flex-column vh-100`}>
      {/*<div className={'d-flex align-items-center justify-content-center'}>*/}
      {/*  /!*<TournamentLogo url={tournament.imageUrl} additionalClasses={classes.Logo}/>*!/*/}
      {/*  <h2 className={'ps-2'}>*/}
      {/*    {tournament.name} {tournament.year}*/}
      {/*  </h2>*/}
      {/*</div>*/}

      <div className={'d-flex justify-content-end pt-3 pb-2 border-bottom border-1'}>
        <h3 className={'me-auto'}>
          {bowler.listName}
        </h3>
        {showPrintButton && (
          <button className={`${classes.PrintButton} btn btn-sm btn-outline-secondary`}
                  role={'button'}
                  onClick={() => window.print()}>
            <i className={'bi-printer pe-2'} aria-hidden={true}/>
            Print
          </button>
        )}
      </div>

      <div className={'row g-0 py-3 border-bottom border-1'}>
        {bowler.address1 && (
          <div className={'col-5'}>
            <address className={classes.Address}>
            <span>
              {bowler.address1}
            </span>
              {bowler.address2 && <span>{bowler.address2}</span>}
              <span>
              {bowler.city}, {bowler.state}
            </span>
              <span>
              {bowler.postal_code}
            </span>
              <span>
              {bowler.country}
            </span>
            </address>
          </div>
        )}

        <div className={'col-5'}>
          {bowler.birthMonth > 0 && (
            <div>
              Date of Birth:
              {' '}
              <strong>
                {bowler.birthMonth} / {bowler.birthDay} / {bowler.birthYear}
              </strong>
            </div>
          )}
          <div>
            Phone:
            {' '}
            <strong>
              {bowler.phone}
            </strong>
          </div>
          <div>
            Email:
            {' '}
            <strong>
              {bowler.email}
            </strong>
          </div>
          <div>
            USBC Number:
            {' '}
            <strong>
              {bowler.usbcId}
            </strong>
          </div>
        </div>

        <div className={'col-7'}>
          {bowler.additionalQuestionResponses && Object.values(bowler.additionalQuestionResponses).map(r => (
            <div key={r.name}>
              {r.label}: <strong>{r.response}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className={`row py-3 border-bottom border-1`}>
        <div className={'col-5'}>
          <div className={'row'}>
            <div className={'col-8 text-end pe-2'}>
              Tournament Average
            </div>
            <div className={'col fw-bold'}>
              {bowler.verifiedAverage}
            </div>
          </div>
          <div className={'row'}>
            <div className={'col-8 text-end pe-2'}>
              Tournament Handicap
            </div>
            <div className={'col fw-bold'}>
              {bowler.handicap}
            </div>
          </div>
          <div className={'row'}>
            <div className={'col-8 text-end pe-2'}>
              IGBO Member
            </div>
            <div className={'col fw-bold'}>
              {bowler.igboMember ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div className={'col-7'}>
          {bowler.teamName && (
            <div className={'row'}>
              <div className={'col-5 text-end pe-2'}>
                Team Name
              </div>
              <div className={'col fw-bold'}>
                {bowler.teamName}
              </div>
            </div>
          )}
          {bowler.position && (
            <div className={'row'}>
              <div className={'col-5 text-end pe-2'}>
                Position
              </div>
              <div className={'col fw-bold'}>
                {bowler.position}
              </div>
            </div>
          )}
          <div className={'row'}>
            <div className={'col-5 text-end pe-2'}>
              Doubles Partner
            </div>
            <div className={'col fw-bold'}>
              {!bowler.doublesPartner && 'n/a'}
              {!!bowler.doublesPartner && bowler.doublesPartner.fullName}
            </div>
          </div>
        </div>
      </div>

      <div className={`row mt-2`}>
        {tournamentHasExtras &&(
          <div className={`col-7`}>
            <h4>
              Bowling Extras
            </h4>

            <table className={`table table-bordered align-middle ${classes.PurchasesTable}`}>
              <thead>
              <tr>
                <th></th>
                <th>Item</th>
                <th className={`text-center`}>
                  Amt.
                </th>
                <th className={`text-center`}>
                  Paid
                </th>
              </tr>
              </thead>
              <tbody>

              {/* Division items first */}
              {tournament.purchasableItems.filter(pi => pi.refinement === 'division').map(pi => {
                // only if the bowler has a purchase for this PI
                const purchase = bowler.purchases.find(p => p.purchasableItem.identifier === pi.identifier);
                const signup = bowler.signups.find(s => s.purchasableItem.identifier === pi.identifier);
                const signedUp = ['requested', 'paid'].includes(signup.status);
                const deactivated = signup.status === 'inactive';

                return (
                  <tr className={``} key={pi.identifier}>
                    <td className={`${classes.SignedUp} text-center`}>
                      {signedUp ? <i className={`bi bi-check2`}></i> : ''}
                      {deactivated && <i className={`bi bi-dash-lg`}></i>}
                    </td>
                    <td className={``}>
                      <p className={`mb-0`}>
                        {pi.name}
                      </p>
                      <p className={`ps-1 mb-0 fst-italic small`}>
                        Division: {pi.configuration.division}
                      </p>
                    </td>
                    <td className={`text-center pe-1`}>
                      ${pi.value}
                    </td>
                    {!!purchase && (
                      <td className={`text-center ${classes.AmountBox} ${classes.PaidAmount}`}>
                        ${pi.value}
                      </td>
                    )}
                    {deactivated && (
                      <td className={`text-center ${classes.AmountBox}`}>
                        &ndash;
                      </td>
                    )}
                    {!purchase && !deactivated && (
                      <td className={`text-center ${classes.AmountBox}`}>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Non-division items, single-use */}
              {tournament.purchasableItems.filter(pi => pi.category === 'bowling' && pi.determination === 'single_use' && pi.refinement !== 'division').map(pi => {
                // only if the bowler has a purchase for this PI
                const purchase = bowler.purchases.find(p => p.purchasableItem.identifier === pi.identifier);
                const signup = bowler.signups.find(s => s.purchasableItem.identifier === pi.identifier);
                const signedUp = ['requested', 'paid'].includes(signup.status);

                return (
                  <tr className={``} key={pi.identifier}>
                    <td className={`${classes.SignedUp} text-center`}>
                      {signedUp ? <i className={`bi bi-check2`}></i> : ''}
                    </td>
                    <td className={``}>
                      <p className={`mb-0`}>
                        {pi.name}
                      </p>
                    </td>
                    <td className={`text-center pe-1`}>
                      ${pi.value}
                    </td>
                    {!!purchase && (
                      <td className={`text-center ${classes.AmountBox} ${classes.PaidAmount}`}>
                        ${pi.value}
                      </td>
                    )}
                    {!purchase && (
                      <td className={`text-center ${classes.AmountBox}`}>
                      </td>
                    )}
                  </tr>
                );
              })}
              </tbody>
            </table>

            {/* multi-use bowling items */}
            {multiUseBowlingItems.length > 0 && (
              <table className={`table table-bordered align-middle ${classes.PurchasesTable}`}>
                <thead>
                <tr>
                  <th></th>
                  <th>Item</th>
                  <th className={`text-center`}>
                    Amt.
                  </th>
                  <th className={`text-center`}>
                    Qty.
                  </th>
                  <th className={`text-center`}>
                    Paid
                  </th>
                </tr>
                </thead>
                <tbody>
                {multiUseBowlingItems.map(pi => {
                  // only if the bowler has a purchase for this PI
                  const purchase = bowler.purchases.find(p => p.purchasableItem.identifier === pi.identifier);
                  const signup = bowler.signups.find(s => s.purchasableItem.identifier === pi.identifier);
                  const signedUp = ['requested', 'paid'].includes(signup.status);

                  return (
                    <tr className={``} key={pi.identifier}>
                      <td className={`${classes.SignedUp} text-center`}>
                        {signedUp ? <i className={`bi bi-check2`}></i> : ''}
                      </td>
                      <td className={``}>
                        <p className={`mb-0`}>
                          {pi.name}
                        </p>
                      </td>
                      <td className={`text-center pe-1`}>
                        ${pi.value}
                      </td>

                      {!!purchase && (
                        <td className={`text-center ${classes.QuantityBox}`}>
                          <i className={`bi bi-x`}/>
                          {' '}{countsByItemID[pi.identifier]}
                        </td>
                      )}
                      {!!purchase && (
                        <td className={`text-center ${classes.AmountBox} ${classes.PaidAmount}`}>
                          ${pi.value * countsByItemID[pi.identifier]}
                        </td>
                      )}

                      {!purchase && (
                        <td className={`text-start ${classes.QuantityBox}`}>
                          <i className={`bi bi-x`}/>
                        </td>
                      )}
                      {!purchase && (
                        <td className={`text-center ${classes.AmountBox}`}>
                        </td>
                      )}
                    </tr>
                  );
                })}
                </tbody>
              </table>
            )}
          </div>
          // End of tournamentHasExtras
        )}

        <div className={tournamentHasExtras ? `col-5` : `col-6`}>
          <h4>
            Fees/Discounts
          </h4>

          {ledgerRows.length > 0 && (
            <table className={`${classes.PurchasesTable} table table-bordered align-middle`}>
              <thead>
              <tr className={``} key={'header-row'}>
                <th className={``}>
                  Item
                </th>
                <th className={`text-center`}>
                  Amt.
                </th>
                <th className={`text-center`}>
                  Paid
                </th>
              </tr>
              </thead>
              <tbody>
              {ledgerRows}
              </tbody>
            </table>
          )}

          <h4>
            Pre-Purchases
          </h4>
          {prePurchaseRows.length === 0 && <p>None</p>}
          {prePurchaseRows.length > 0 && (
            <table className={`table table-bordered align-middle ${classes.PurchasesTable}`}>
              <thead>
              <tr>
                <th>Item</th>
                <th className={`text-center`}>
                  Amt.
                </th>
                <th className={`text-center`}>
                  Qty.
                </th>
                <th className={`text-center`}>
                  Paid
                </th>
              </tr>
              </thead>
              <tbody>
              {prePurchaseRows}
              </tbody>
            </table>
          )}

          <h4>
            Totals
          </h4>

          <table className={`table table-bordered ${classes.TotalsTable}`}>
            <tbody>
            <tr>
              <td>
                Total pre-paid
              </td>
              <td className={`${classes.Amount}`}>
                ${bowler.amountPaid}
              </td>
            </tr>
            <tr>
              <td>
                Outstanding charges
              </td>
              <td className={`${classes.Amount}`}>
                ${bowler.amountOutstanding}
              </td>
            </tr>
            <tr>
              <td>
                Charges at Registration
              </td>
              <td className={`${classes.AmountBox}`}>

              </td>
            </tr>
            <tr>
              <td>
                Due at Registration
              </td>
              <td className={`${classes.AmountBox}`}>

              </td>
            </tr>
            </tbody>
          </table>

          {/* Total charges */}
          {/*  Pre-paid*/}
          {/*  Outstanding charges*/}
          {/*  Charges at Registration*/}
          {/*  Total due at Registration*/}
        </div>
      </div>

      <div className={`${classes.Agreement} mt-auto`}>
        <div className={'row'}>
          <div className={`col-7 offset-5`}>
            <div className={classes.Signature}>
              <i className={'bi-x-lg'} aria-hidden={true}/>
            </div>
            <p className={`${classes.Acknowledgement} m-0 pt-2`}>
              I agree that the information contained on this sheet is correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInSheet;

import classes from './SignInSheet.module.scss';
import TournamentLogo from "../../Registration/TournamentLogo/TournamentLogo";

const SignInSheet = ({bowler, showPrintButton}) => {
  if (!bowler) {
    return '';
  }

  let bowlerFirstName = bowler.first_name;
  if (bowler.preferred_name && bowler.preferred_name.length > 0) {
    bowlerFirstName = bowler.preferred_name;
  }

  const countsByItemID = {};
  if (bowler.purchases) {
    bowler.purchases.forEach(p => {
      const piId = p.purchasable_item_identifier;
      if (!countsByItemID[piId]) {
        countsByItemID[piId] = 0;
      }
      countsByItemID[piId] += 1;
    });
  }

  return (
    <div className={`${classes.SignInSheetHtml} d-flex flex-column vh-100`}>
      <div className={'d-flex align-items-center justify-content-center'}>
        <TournamentLogo url={bowler.tournament.image_url} additionalClasses={classes.Logo} />
        <h2 className={'ps-2'}>
          {bowler.tournament.name} {bowler.tournament.year}
        </h2>
      </div>

      <div className={'d-flex justify-content-end pt-3 pb-2 border-bottom border-1'}>
        <h3 className={'me-auto'}>
          {bowler.last_name}, {bowlerFirstName}
        </h3>
        {showPrintButton && (
          <button className={`${classes.PrintButton} btn btn-sm btn-outline-secondary`}
                  role={'button'}
                  onClick={() => window.print()}>
            <i className={'bi-printer pe-2'} aria-hidden={true} />
            Print
          </button>
        )}
      </div>

      <div className={'row py-3'}>
        <div className={'col-6'}>
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

        <div className={'col-6'}>
          <div>
            Date of Birth: {bowler.birth_month} / {bowler.birth_day} / {bowler.birth_year}
          </div>
          <div>
            Phone: {bowler.phone}
          </div>
          <div>
            Email: {bowler.email}
          </div>
          <div>
            USBC Number: {bowler.usbc_id}
          </div>
          <div className={'pt-2'}>
            IGBO Member:{' '}
            <strong>
              {bowler.igbo_member ? 'Yes' : 'No'}
            </strong>
          </div>
        </div>
      </div>

      <div className={`row g-0 pb-3 border-bottom border-1 ${classes.ExtraQuestions}`}>
        <div className={'col-12'}>
          {bowler.additional_question_responses && Object.values(bowler.additional_question_responses).map(r => (
            <div key={r.name}>
              {r.label}: <strong>{r.response}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className={`row g-0 py-3 border-bottom border-1`}>
        <div className={'col-5'}>
          <div className={'row'}>
            <div className={'col-8 text-end pe-2'}>
              Tournament Average
            </div>
            <div className={'col fw-bold'}>
              {bowler.verified_average}
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
        </div>
        <div className={'col-7'}>
          {bowler.team && (
            <div className={'row'}>
              <div className={'col-5 text-end pe-2'}>
                Team Name
              </div>
              <div className={'col fw-bold'}>
                {bowler.team.name}
              </div>
            </div>
          )}
          <div className={'row'}>
            <div className={'col-5 text-end pe-2'}>
              Doubles Partner
            </div>
            <div className={'col fw-bold'}>
              {!bowler.doubles_partner && 'n/a'}
              {bowler.doubles_partner && bowler.doubles_partner.full_name}
            </div>
          </div>
        </div>
      </div>

      <div className={`row g-0 py-3 border-bottom border-1`}>
        <h4>
          Fees &amp; Extras
        </h4>
        <div className={'col-6'}>
          {bowler.purchases && bowler.purchases.map(p => {
            const quantity = countsByItemID[p.purchasable_item_identifier];
            if (quantity === 0) {
              return '';
            }
            const multiplier = quantity === 1 ? '' : (
              <span>
                <i className={'bi-x px-1'}aria-hidden={true} />
                {quantity}
                <span className={'visually-hidden'}>
                  purchased
                </span>
              </span>
              );
            countsByItemID[p.purchasable_item_identifier] = 0;
            let note = false;
            if (p.configuration.division) {
              note = `Division ${p.configuration.division}`;
            } else if (p.configuration.denomination) {
              note = p.configuration.denomination;
            }
            return (
              <div className={'row'} key={p.identifier}>
                <div className={'col-8 text-end pe-2'}>
                  {p.name}
                  {note && <span className={classes.PurchaseNote}>{note}</span>}
                </div>
                <div className={'col fw-bold'}>
                  ${p.value}
                  {multiplier}
                </div>
              </div>
            );
          })}
        </div>
        <div className={'col'}>
          <div className={'row'}>
            <div className={'col-8 text-end pe-2'}>
              Total paid
            </div>
            <div className={'col fw-bold'}>
              ${bowler.amount_paid}
            </div>
          </div>

          {bowler.free_entry && bowler.free_entry.confirmed && (
            <div className={'row my-2'}>
              <div className={'col-8 text-end pe-2'}>
                Free entry
                <span className={classes.PurchaseNote}>{bowler.free_entry.unique_code}</span>
              </div>
              <div className={'col fw-bold'}>
                ${bowler.ledger_entries.filter(le => le.source === 'free_entry').reduce((prev, curr) => prev + parseInt(curr.credit), 0)}
              </div>
            </div>
          )}

          <div className={'row my-2'}>
            <div className={'col-8 text-end pe-2'}>
              Total paid
            </div>
            <div className={'col fw-bold'}>
              ${bowler.amount_paid}
            </div>
          </div>

          <div className={'row pt-2'}>
            <div className={'col-8 text-end pe-2'}>
              Total outstanding
            </div>
            <div className={'col fw-bold'}>
              ${bowler.amount_due}
            </div>
          </div>
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

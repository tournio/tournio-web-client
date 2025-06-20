import {Accordion, Card} from "react-bootstrap";
import Link from "next/link";

import Basics from './Basics';
import AdditionalQuestions from "./AdditionalQuestions";
import Capacity from './Capacity';
import CloseTournament from "./CloseTournament";
import Counts from "./Counts";
import RegistrationOptions from "../Tournament/RegistrationOptions";
import EditableConfiguration from "./EditableConfiguration";
import Contacts from "../Tournament/Contacts";
import PurchasableItems from "./PurchasableItems";
import Downloads from "./Downloads";
import RegistrationsWeek from "./Charts/RegistrationsWeek";
import RegistrationTypesWeek from "./Charts/RegistrationTypesWeek";
import DivisionItemsWeek from "./Charts/DivisionItemsWeek";
import OptionalItemsWeek from "./Charts/OptionalItemsWeek";
import MassActions from "../MassActions/MassActions";
import LogoImage from "../LogoImage/LogoImage";
import DeleteTournament from "../Tournament/DeleteTournament";
import Users from "../Tournament/Users";
import Shifts from "../TournamentInPrep/Shifts";
import {useTournament} from "../../../director";

import classes from './VisibleTournament.module.scss';
import {useEffect, useState} from "react";
import {isPast} from "date-fns";

const VisibleTournament = ({closeTournament}) => {
  const EDITABLE_CONFIG_ITEMS = [
    "display_capacity",
    "publicly_listed",
    "email_in_dev",
  ];
  const MONEY_CONFIG_ITEMS = [
    "accept_payments",
    "skip_stripe",
    "enable_unpaid_signups",
    "enable_free_entries",
  ];

  const {loading, tournament} = useTournament();

  const [editableConfigItems, setEditableConfigItems] = useState(EDITABLE_CONFIG_ITEMS);
  const [registeringWithoutPayments, setRegisteringWithoutPayments] = useState(false);

  useEffect(() => {
    if (loading || !tournament) {
      return;
    }
    let items = [...editableConfigItems];

    // Hide the automatic_late_fees option if it doesn't make sense
    const lateFeeItem = tournament.purchasable_items.ledger.find(item => item.determination === 'late_fee');
    if (!lateFeeItem || isPast(Date.parse(lateFeeItem.configuration.applies_at))) {
      items = items.filter(elem => elem !== "automatic_late_fees");
    }

    // Hide the automatic_discount_voids option if it doesn't make sense
    const earlyDiscountItem = tournament.purchasable_items.ledger.find(item => item.determination === 'early_discount');
    if (!earlyDiscountItem || isPast(Date.parse(earlyDiscountItem.configuration.valid_until))) {
      items = items.filter(elem => elem !== "automatic_discount_voids");
    }

    // hide/show some things based on whether we can accept payments
    const relevantItem = tournament.config_items.find(({key}) => key === 'registration_without_payments');
    if (relevantItem && relevantItem.value) {
      setRegisteringWithoutPayments(true);
    } else {
      items = items.concat(MONEY_CONFIG_ITEMS)
    }

    setEditableConfigItems(items);
  }, [loading, tournament]);

  if (loading) {
    return '';
  }

  let purchaseCharts = '';
  if (!registeringWithoutPayments) {
    const divisionNameSet = new Set();
    tournament.purchasable_items.division.forEach(({name}) => {
      divisionNameSet.add(name);
    });
    purchaseCharts = <>
      {divisionNameSet.values().map(name => <DivisionItemsWeek title={name} key={name}/>)}
      <OptionalItemsWeek title={'Optional Events'}
                         dataKeys={['bowling']}/>
      <OptionalItemsWeek title={'Extras'}
                         dataKeys={['banquet', 'product']}/>
      </>
  }

  const lessImportantStuff = (
    <>
      <Downloads/>
      <Accordion className={'mb-3'}>
        <Basics eventKey={'0'}/>
        <AdditionalQuestions eventKey={'2'}/>
        {!registeringWithoutPayments && <PurchasableItems eventKey={'3'}/>}
      </Accordion>

      <Contacts/>
      <Users/>

      {tournament.state === 'active' && (
        <>
          <hr />
          <CloseTournament closeTournament={closeTournament} />
        </>
      )}
      {tournament.state === 'closed' && (
        <>
          <hr />
          <DeleteTournament/>
          </>
        )}
    </>
  );

  return (
    <div className={classes.VisibleTournament}>
      <div className={'row'}>

        <div className={'col-12 col-md-4 col-xl-3'}>

          {tournament.state === 'closed' && (
            <div className={`${classes.Closed} p-3 mb-3`}>
              <h5 className={'fw-light m-0'}>
                Registration is Closed
              </h5>
            </div>
          )}
          <LogoImage src={tournament.image_url} />
          <Card className={'text-center'} border={'0'}>
            <Card.Body>
              <Card.Title>
                {tournament.name}
              </Card.Title>
              <Link href={`/tournaments/${tournament.identifier}`} target={'_new'}>
                Front Page
                <i className={classes.ExternalLink + " bi-box-arrow-up-right"} aria-hidden="true"/>
              </Link>
            </Card.Body>
          </Card>

          <Counts/>

          <RegistrationOptions/>
          <EditableConfiguration editableKeys={editableConfigItems} />
          <Shifts/>
          <MassActions/>

          <div className={'d-none d-md-block d-lg-none'}>
            <hr />
            {lessImportantStuff}
          </div>
        </div>

        <div className={'col-12 col-md-8 col-lg-5 col-xl-6'}>
          <Capacity/>
          <RegistrationsWeek/>
          <RegistrationTypesWeek/>
          {purchaseCharts}
        </div>

        <div className={'d-md-none d-lg-block col-12 col-md-4 col-lg-3'}>
          {lessImportantStuff}
        </div>
      </div>
    </div>
  );
}

export default VisibleTournament;

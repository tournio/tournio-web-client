import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";

import classes from './VisibleTournament.module.scss';
import {Placeholder} from "react-bootstrap";
import {useModernTournament} from "../../../director";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";

const Counts = () => {
  const router = useRouter();
  const {loading, tournament} = useModernTournament();
  const [currentPath, setCurrentPath] = useState();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setCurrentPath(router.asPath);
  }, [router.isReady]);

  if (loading) {
    return (
      <Placeholder animation={'glow'}>
        <ListGroup variant={'flush'}>
          <ListGroup.Item>
            <Placeholder xs={4}/>
          </ListGroup.Item>
          <ListGroup.Item>
            <Placeholder xs={6}/>
          </ListGroup.Item>
          <ListGroup.Item>
            <Placeholder xs={5}/>
          </ListGroup.Item>
        </ListGroup>
      </Placeholder>
    );
  }

  const hasTeamEvent = tournament.events.some(({rosterType}) => rosterType === 'team');
  const hasTriosEvent = tournament.events.some(({rosterType}) => rosterType === 'trio');

  // if we can't accept payments, there are some components we should not show.
  const registeringWithoutPayments = tournament.config.registration_without_payments;

  return (
    <div className={classes.Counts}>
      <Card>
        <ListGroup variant={'flush'}>
          <ListGroup.Item className={'d-flex justify-content-between align-items-center'}
                          variant={'primary'}
                          action={true}
                          as={Link}
                          href={`${currentPath}/bowlers`}>
            Bowlers
            <Badge pill={true}>
              {tournament.bowlerCount}
            </Badge>
          </ListGroup.Item>
          {hasTeamEvent && (
            <ListGroup.Item className={'d-flex justify-content-between align-items-center'}
                            variant={'primary'}
                            action={true}
                            as={Link}
                            href={`${currentPath}/teams`}>
              Teams
              <Badge pill={true}>
                {tournament.teamCount}
              </Badge>
            </ListGroup.Item>
          )}
          {hasTriosEvent && (
            <ListGroup.Item className={'d-flex justify-content-between align-items-center'}
                            variant={'primary'}
                            action={true}
                            as={Link}
                            href={`${currentPath}/teams`}>
              Teams
              <Badge pill={true}>
                {tournament.teamCount}
              </Badge>
            </ListGroup.Item>
          )}
          {!registeringWithoutPayments && (
            <ListGroup.Item className={'d-flex justify-content-between align-items-center'}
                            variant={'primary'}
                            action={true}
                            as={Link}
                            href={`${currentPath}/free_entries`}>
              Free Entries
              <Badge pill={true}>
                {tournament.freeEntryCount}
              </Badge>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>
    </div>
  );
}

export default Counts;

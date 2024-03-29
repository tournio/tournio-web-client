import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import classes from '../TournamentInPrep/TournamentInPrep.module.scss';
import {useTournament} from "../../../director";

const Users = () => {
  const {loading, tournament} = useTournament();

  if (loading) {
    return;
  }

  return (
    <Card className={classes.Card}>
      <Card.Header as={'h5'} className={'fw-light'}>
        Admin Users
      </Card.Header>
      <ListGroup variant={'flush'}>
        {tournament.users.length === 0 && (
          <ListGroup.Item className={'px-3'}>
            <p className={'m-0 fst-italic'}>
              None yet
            </p>
          </ListGroup.Item>
        )}
        {tournament.users.map(user => (
          <ListGroup.Item key={user.identifier} className={'px-3 py-2'}>
            <p className={`fw-bold m-0`}>
              {user.last_name}, {user.first_name}
            </p>
            <p className={'m-0'}>
              {user.email}
            </p>
            <p className={'small m-0'}>
              <strong>
                Last signed in:{' '}
              </strong>
              {user.last_sign_in_at}
            </p>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
}

export default Users;

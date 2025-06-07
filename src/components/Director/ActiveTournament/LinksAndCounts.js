import Link from "next/link";
import {useRouter} from "next/router";
import classes from './ActiveTournament.module.scss';

const LinksAndCounts = ({tournament}) => {
  const router = useRouter();

  if (!tournament || !router.isReady) {
    return '';
  }

  const hasTeamEvent = tournament.events.some(({rosterType}) => rosterType === 'team');

  return (
    <div className={classes.LinksAndCounts}>
      <div className={'card mb-3'}>
        <ul className={'list-group list-group-flush'}>
          <li className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center`}>
            <Link href={`${router.asPath}/bowlers`}
                  className={''}>
              Bowlers
            </Link>
            <span className={''}>
              {tournament.bowlerCount}
            </span>
          </li>

          {hasTeamEvent && (
            <li className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center`}>
              <Link href={`${router.asPath}/teams`}
                    className={''}>
                Teams
              </Link>
              <span className={''}>
                {tournament.teamCount}
              </span>
            </li>
          )}

          {(tournament.config.enable_free_entries || tournament.freeEntryCount > 0) && (
            <li className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center`}>
              <Link href={`${router.asPath}/free_entries`}
                    className={''}>
                Free Entries
              </Link>
              <span className={''}>
                {tournament.freeEntryCount}
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default LinksAndCounts;

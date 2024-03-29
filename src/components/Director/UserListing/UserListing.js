import {useMemo} from "react";
import {Col, Row} from "react-bootstrap";
import Link from 'next/link';
import {useTable, useSortBy, useFilters} from 'react-table';

import SortableTableHeader from "../../ui/SortableTableHeader/SortableTableHeader";
import UserFilterForm from "../UserFilterForm/UserFilterForm";
import {tournamentName} from '../../../utils';

import classes from './UserListing.module.scss';

const UserListing = ({users, tournamentOrgs}) => {
  const columns = useMemo(() => [
    {
      id: 'lastName',
      Header: ({column}) => <SortableTableHeader text={'Last Name'} column={column}/>,
      accessor: 'lastName',
    },
    {
      id: 'firstName',
      accessor: 'firstName',
      Header: 'First Name',
      disableSortBy: true,
    },
    {
      id: 'email',
      Header: ({column}) => <SortableTableHeader text={'Email'} column={column}/>,
      accessor: 'email',
      Cell: ({row}) => (
        <Link href={'/director/users/' + row.original.identifier}>
          {row.original.email}
        </Link>
      )
    },
    {
      id: 'role',
      Header: 'Role',
      accessor: 'role',
      disableSortBy: true,
    },
    {
      id: 'tournamentOrgs',
      accessor: 'tournamentOrgs',
      Header: 'Org(s)',
      Cell: ({row}) => row.original.tournamentOrgs.length > 0 ? row.original.tournamentOrgs.map(t => (t.identifier)).join(', ') : 'n/a',
      filter: tournamentName,
      disableSortBy: true,
    },
    {
      id: 'lastSignInAt',
      accessor: 'lastSignInAt',
      Header: ({column}) => <SortableTableHeader text={'Last Signed In'} column={column}/>,
    },
  ], [users]);

  let data = [];
  if (users) {
    data = users;
  }

  // tell react-table which things we want to use (sorting, filtering)
  // and retrieve properties/functions they let us hook into
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
    setAllFilters,
  } = useTable(
    {columns, data},
    useFilters,
    useSortBy,
  );

  const filterThatData = (criteria) => {
    if (criteria.tournamentOrgId) {
      setFilter('tournamentOrgId', criteria.tournamentOrgId);
    } else if (criteria.has_no_tournament_org) {
      setFilter('tournamentOrgs', '');
    } else {
      setFilter('tournamentOrgs', undefined);
    }

    setFilter('email', criteria.email);

    if (criteria.has_not_signed_in) {
      setFilter('last_sign_in_at', 'n/a');
    } else {
      setFilter('last_sign_in_at', undefined);
    }
  }

  const resetThoseFilters = () => {
    setAllFilters([]);
  }

  //////////////////////////////////////////////////////////////

  if (!users || !tournamentOrgs) {
    return '';
  }

  return (
    <div className={classes.UserListing}>
      <Row>
        <Col>
          {users.length === 0 && (
            <div className={'display-6 text-center'}>
              No users to display.
            </div>
          )}
          {users.length > 0 && (
            <>
              <UserFilterForm onFilterApplication={filterThatData}
                              onFilterReset={resetThoseFilters}
                              tournamentOrgs={tournamentOrgs}/>

              <div className={'table-responsive'}>
                <table className={'table table-striped table-hover'} {...getTableProps}>
                  <thead>
                  {headerGroups.map((headerGroup, i) => (
                    <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column, j) => (
                        <th key={j} {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.render('Header')}
                        </th>
                      ))}
                    </tr>
                  ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                  {rows.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr key={i} {...row.getRowProps()}>
                        {row.cells.map((cell, j) => (
                          <td key={j} {...cell.getCellProps()}>
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default UserListing;

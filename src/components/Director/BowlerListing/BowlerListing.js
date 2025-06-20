import {useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import {useTable, useSortBy, useFilters} from 'react-table';
import {Overlay, Popover} from "react-bootstrap";

import SortableTableHeader from "../../ui/SortableTableHeader/SortableTableHeader";
import BowlerFilterForm from "../BowlerFilterForm/BowlerFilterForm";
import {doesNotEqual, isOrIsNot, equals} from "../../../utils";
import {directorApiRequest} from "../../../director";
import {useLoginContext} from "../../../store/LoginContext";

import classes from './BowlerListing.module.scss';

const IgboMemberCell = ({
                          value: initialValue,
                          row: {index, original},
                          column: {id},
                          updateTheData,
                        }) => {
  const [checked, setChecked] = useState(initialValue);
  const [showPopover, setShowPopover] = useState(false);
  const target = useRef(null);
  const {authToken} = useLoginContext();

  const onChangeSuccess = (checked) => {
    updateTheData(index, id, checked);

    // trigger the popover
    setShowPopover(true);
  }

  const onChangeFailure = (data) => {
    console.log("Failure", data);
  }

  const submitStatusChange = (newStatus) => {
    const uri = `/bowlers/${original.identifier}`;
    const requestConfig = {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        bowler: {
          verified_data: {
            igbo_member: newStatus,
          }
        }
      }
    }
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: () => onChangeSuccess(newStatus),
      onFailure: onChangeFailure,
    });
  }

  const igboMemberBoxChanged = (event) => {
    const isCheckedNow = event.target.checked;
    setChecked(isCheckedNow);
    submitStatusChange(isCheckedNow);
  }

  useEffect(() => {
    setChecked(initialValue);
  }, [initialValue]);

  return (
    <div className={classes.IgboMember}>
      <input type={'checkbox'}
             className={'form-check-input'}
             checked={checked}
             onChange={igboMemberBoxChanged}
             ref={target}
      />
      <Overlay target={target.current}
               rootClose={true}
               onHide={() => {
                 setShowPopover(false)
               }}
               show={showPopover}
               placement={'right'}>
        {(props) => (
          <Popover id={`popover-${id}`} {...props}>
            <Popover.Body>
              Saved
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
    </div>
  );
}

const BowlerListing = ({bowlers, showTeams, onBowlerUpdate, showMoney=true}) => {
  const nameSortFunc = (rowA, rowB, columnId) => {
    let [a, b] = [rowA.values[columnId], rowB.values[columnId]];
    return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
  }

  const columns = useMemo(() => {
    const head = [
      {
        id: 'name',
        Header: ({column}) => <SortableTableHeader text={'Name'} column={column}/>,
        accessor: 'full_name',
        sortType: nameSortFunc,
        Cell: ({row, cell}) => {
          return (
            <Link href={{
              pathname: `/director/tournaments/[identifier]/bowlers/[bowlerId]`,
              query: {
                identifier: row.original.tournament.identifier,
                bowlerId: row.original.identifier,
              }
            }
            }>
              {cell.value}
            </Link>
          )
        }
      },
      {
        id: 'email',
        Header: ({column}) => <SortableTableHeader text={'Email'} column={column}/>,
        accessor: 'email',
        sortType: nameSortFunc,
      },
    ];
    const tail = [
      {
        Header: 'Doubles Partner',
        accessor: 'doubles_partner_name',
        disableSortBy: true,
      },
      {
        Header: ({column}) => <SortableTableHeader text={'Date Registered'} column={column}/>,
        accessor: 'date_registered',
      },
      {
        Header: 'IGBO Member?',
        accessor: 'igbo_member',
        Cell: IgboMemberCell,
        disableSortBy: true,
        filter: isOrIsNot,
      },
    ];

    if (showTeams) {
      head.push(      {
          Header: ({column}) => <SortableTableHeader text={'Team Name'} column={column}/>,
          accessor: 'team_name',
          visible: false,
          sortType: nameSortFunc,
          Cell: ({row, value}) => {
            return (!value) ? 'n/a' : (
              <Link href={{
                pathname: '/director/tournaments/[identifier]/teams/[teamId]',
                query: {
                  identifier: row.original.tournament.identifier,
                  teamId: row.original.team_identifier,
                }
              }}>
                {value}
              </Link>
            )
          },
          disableSortBy: false,
          filter: equals,
        },
      );
    }

    tail.push(
      {
        Header: showMoney ? 'Free Entry?' : '',
        accessor: 'has_free_entry',
        disableSortBy: true,
        Cell: ({cell: {value}}) => {
          const classes = value ? ['text-success', 'bi-check-lg', 'bi'] : ['text-danger', 'bi-dash-lg', 'bi'];
          const text = value ? 'Yes' : 'No';
          return showMoney && (
            <div className={'text-center'}>
              <i className={classes.join(' ')} aria-hidden={true}/>
              <span className={'visually-hidden'}>{text}</span>
            </div>
          );
        }
      },
      {
        Header: showMoney ? 'Paid' : '',
        accessor: 'amount_paid',
        disableSortBy: true,
        filter: equals,
        Cell: ({value}) => showMoney ? `$${value}` : '',
      },
      {
        Header: showMoney ? 'Due' : '',
        accessor: 'amount_due',
        filter: doesNotEqual,
        Cell: ({value}) => showMoney ? `$${value}` : '',
      },
    );

    return head.concat(tail);
  }, []);

  let data = [];
  if (bowlers) {
    data = bowlers;
  }

  const updateTheData = (rowIndex, columnId, isChecked) => {
    const oldRow = data[rowIndex];
    const newRow = {...oldRow, [columnId]: isChecked};
    const newData = [...data];
    newData[rowIndex] = newRow;
    data = newData;

    onBowlerUpdate(newRow);
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
    {columns, data, updateTheData},
    useFilters,
    useSortBy,
  );

  if (!bowlers) {
    return '';
  }

  let list = '';
  if (data.size === 0) {
    list = (
      <div className={'display-6 text-center'}>
        No bowlers to display.
      </div>
    );
  } else {
    list = (
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
    );
  }

  const filterThatData = (criteria) => {
    setFilter('name', criteria.name);
    setFilter('email', criteria.email);

    if (criteria.amount_due) {
      setFilter('amount_due', 0);
    } else {
      setFilter('amount_due', undefined);
    }
    setFilter('has_free_entry', criteria.has_free_entry)
    setFilter('igbo_member', criteria.igbo_member);
    if (showTeams) {
      if (criteria.no_team) {
        setFilter('team_name', 'n/a');
      } else {
        setFilter('team_name', undefined);
      }
    }
    if (criteria.no_partner) {
      setFilter('doubles_partner_name', 'n/a');
    } else {
      setFilter('doubles_partner_name', undefined);
    }
  }

  const resetThoseFilters = () => {
    setAllFilters([]);
  }

  return (
    <div className={classes.BowlerListing}>
      {data.length > 0 && (
        <BowlerFilterForm onFilterApplication={filterThatData}
                          onFilterReset={resetThoseFilters}
                          showMoney={showMoney}
                          includeTeamFilters={showTeams}/>
      )}
      {list}
    </div>
  );
};

export default BowlerListing;

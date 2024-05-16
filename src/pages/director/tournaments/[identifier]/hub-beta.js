import {useLoginContext} from "../../../../store/LoginContext";
import {useModernTournament} from "../../../../director";
import LoadingMessage from "../../../../components/ui/LoadingMessage/LoadingMessage";
import ErrorAlert from "../../../../components/common/ErrorAlert";
import DirectorLayout from "../../../../components/Layout/DirectorLayout/DirectorLayout";
import Hub from "../../../../components/Director/Hub/Hub";
import StateAlert from "../../../../components/Director/Hub/StateAlert";


const Page = () => {
  const {authToken} = useLoginContext();
  const {tournament, loading, error, tournamentUpdatedQuietly} = useModernTournament();

  if (loading) {
    return <LoadingMessage message={'Retrieving tournament details...'}/>
  }
  if (error) {
    return <ErrorAlert message={error}/>
  }
  if (!tournament) {
    return <ErrorAlert message={'Retrieving tournament details...'}/>
  }



  return (
    <div>
      <StateAlert state={tournament.state} />
      <Hub tournament={tournament}/>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <DirectorLayout>
      {page}
    </DirectorLayout>
  )
}

export default Page;

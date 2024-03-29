import {useRouter} from "next/router";
import {Card, Col, Row} from "react-bootstrap";
import DirectorLayout from "../../components/Layout/DirectorLayout/DirectorLayout";
import PasswordResetForm from "../../components/Director/PasswordResetForm/PasswordResetForm";

const Page = () => {
  const router = useRouter();
  const {token} = router.query;

  return (
    <div>
      <Row>
        <Col xs={12} sm={{span: 8, offset: 2}} md={{span: 6, offset: 3}}>
          <PasswordResetForm token={token} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={{span: 8, offset: 2}} md={{span: 6, offset: 3}}>
          <Card className={'border-0 text-center'}>
            <Card.Body>
              <Card.Link href={'/'}>
                Registration Home
              </Card.Link>
              <Card.Link href={'/director/login'}>
                Log In
              </Card.Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <DirectorLayout>
      {page}
    </DirectorLayout>
  );
}

export default Page;
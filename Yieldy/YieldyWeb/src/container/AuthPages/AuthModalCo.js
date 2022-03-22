import AuthForm, { STATE_LOGIN } from 'components/Form/AuthFormCo';
import React from 'react';
import { Modal, ModalBody } from 'reactstrap';

const AuthModalCo = props => {
    const [isShow, setIsShow] = useState(true);
    const [authState, setAuthState] = useState(STATE_LOGIN);

    const toggle = () => {
        setIsShow(!isShow);
    };

    const handleAuthState = authState => {
        setAuthState(authState);
    };

    return (
        <div>
            <Modal
                isOpen={isShow}
                toggle={toggle}
                size="sm"
                fade={false}
                centered>
                <ModalBody>
                    <AuthForm
                        userType={"Company Owner"}
                        authState={authState}
                        onChangeAuthState={handleAuthState}
                    />
                </ModalBody>
            </Modal>
        </div>
    );
}

export default AuthModalCo;

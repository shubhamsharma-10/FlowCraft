import jwt from 'jsonwebtoken';
import config from '../../utils/config.js';

type UserDetail = {
    id: string;
    email: string;
    name: string;
}

const generateAccessToken = (userDetail: UserDetail) => {
    const accessToken = jwt.sign({
        id: userDetail.id,
        email: userDetail.email,
        name: userDetail.name
    }, config.jwtSecret!);

    return accessToken
}

export default generateAccessToken;
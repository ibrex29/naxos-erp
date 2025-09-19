import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY, ROLE_KEY } from '.';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
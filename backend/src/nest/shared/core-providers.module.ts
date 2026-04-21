import { Module } from '@nestjs/common';
import { systemClock } from '../../core/shared/clock';
import { uuidV4 } from '../../core/shared/id';
import { TOKENS } from './tokens';

@Module({
  providers: [
    { provide: TOKENS.idGenerator, useValue: uuidV4 },
    { provide: TOKENS.clock, useValue: systemClock },
  ],
  exports: [TOKENS.idGenerator, TOKENS.clock],
})
export class CoreProvidersModule {}


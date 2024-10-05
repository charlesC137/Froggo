import { NgModule } from '@angular/core';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:8080', options: {} };

@NgModule({
  imports: [SocketIoModule.forRoot(config)],
  exports: [SocketIoModule],
})
export class SharedSocketModule {}

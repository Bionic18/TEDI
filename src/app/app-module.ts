import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { WelcomePage } from './features/welcome/welcome-page/welcome-page';
import { SignUp } from './features/welcome/sign-up/sign-up';
import { Admin } from './features/admin/admin';
import { BrowseEvents } from './features/events/browse-events/browse-events';
import { EventDetails } from './features/events/browse-events/event-details/event-details';
import { ManageEvents } from './features/events/manage-events/manage-events';
import { CreateEvent } from './features/events/manage-events/create-event/create-event';
import { EditEvent } from './features/events/manage-events/edit-event/edit-event';
import { Messaging } from './features/messaging/messaging';

@NgModule({
  declarations: [
    App,
    WelcomePage,
    SignUp,
    Admin,
    BrowseEvents,
    EventDetails,
    ManageEvents,
    CreateEvent,
    EditEvent,
    Messaging,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}

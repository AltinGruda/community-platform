import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotificationTypes } from 'oa-shared'
import { FactoryNotification } from 'src/test/factories/Notification'
import { getFormattedNotifications } from './getFormattedNotifications'

describe('getFormattedNotifications', () => {
  NotificationTypes.forEach((type) => {
    it(`returns a well formatted ${type} message`, () => {
      const [notification] = getFormattedNotifications([
        FactoryNotification({ type }),
      ])
      const { container } = render(
        <MemoryRouter>{notification.children}</MemoryRouter>,
      )
      expect(container).not.toBeEmptyDOMElement()
    })
  })
})

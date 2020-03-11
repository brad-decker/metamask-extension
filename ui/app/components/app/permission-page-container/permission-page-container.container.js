import { connect } from 'react-redux'
import PermissionPageContainer from './permission-page-container.component'
import {
  getPermissionsDescriptions,
  getDomainMetadata,
  getMetaMaskIdentities,
} from '../../../selectors/selectors'

const mapStateToProps = (state, ownProps) => {
  const { request, cachedOrigin, selectedIdentities } = ownProps
  const { metadata: requestMetadata = {} } = request || {}

  const domainMetadata = getDomainMetadata(state)
  const origin = requestMetadata.origin || cachedOrigin
  const targetDomainMetadata = (domainMetadata[origin] || { name: origin, icon: null })

  const allIdentities = getMetaMaskIdentities(state)
  const allIdentitiesSelected = Object.keys(selectedIdentities).length === Object.keys(allIdentities).length

  return {
    permissionsDescriptions: getPermissionsDescriptions(state),
    requestMetadata,
    targetDomainMetadata,
    allIdentitiesSelected,
  }
}

export default connect(mapStateToProps)(PermissionPageContainer)

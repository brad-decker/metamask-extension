import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import Identicon from '../../../ui/identicon'
import IconWithFallBack from '../../../ui/icon-with-fallback'
import Tooltip from '../../../ui/tooltip-v2'
import classnames from 'classnames'

export default class PermissionPageContainerContent extends PureComponent {

  static propTypes = {
    requestMetadata: PropTypes.object.isRequired,
    domainMetadata: PropTypes.object.isRequired,
    selectedPermissions: PropTypes.object.isRequired,
    permissionsDescriptions: PropTypes.object.isRequired,
    onPermissionToggle: PropTypes.func.isRequired,
    selectedIdentities: PropTypes.array,
    allIdentitiesSelected: PropTypes.bool,
    redirect: PropTypes.bool,
    permissionRejected: PropTypes.bool,
  }

  static defaultProps = {
    redirect: null,
    permissionRejected: null,
    selectedIdentities: [],
    allIdentitiesSelected: false,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  renderAccountInfo = (account) => {
    return (
      <div className="permission-approval-visual__account-info">
        <div className="permission-approval-visual__account-info__label">
          { account.label }
        </div>
        <div className="permission-approval-visual__account-info__address">
          { account.truncatedAddress }
        </div>
      </div>
    )
  }

  renderPermissionApprovalVisual = () => {
    const {
      requestMetadata, domainMetadata, selectedIdentities, redirect, permissionRejected,
    } = this.props

    return (
      <div className="permission-approval-visual">
        <section>
          <IconWithFallBack icon={domainMetadata.icon} name={domainMetadata.name} />
          { redirect ? null : <h1>{domainMetadata.name}</h1> }
          { redirect ? null : <h2>{requestMetadata.origin}</h2> }
        </section>
        { redirect
          ? permissionRejected
            ? <span className="permission-approval-visual__reject" ><i className="fa fa-times-circle" /></span>
            : <span className="permission-approval-visual__check" />
          : null
        }
        { redirect
          ? <img className="permission-approval-visual__broken-line" src="/images/broken-line.svg" />
          : null
        }
        { redirect
          ? (
            <section>
              <div className="permission-approval-visual__identicon-container">
                <div className="permission-approval-visual__identicon-border" />
                <Identicon
                  className="permission-approval-visual__identicon"
                  address={selectedIdentities[0].address}
                  diameter={54}
                />
              </div>
            </section>
          )
          : null
        }
        <img className="permission-approval-visual__broken-line" src="/images/broken-line.svg" />
        <section>
          <div className="permission-approval-visual__identicon-container">
            <div className="permission-approval-visual__identicon-border">
              <Identicon
                className="permission-approval-visual__identicon"
                address={selectedIdentities[0].address}
                diameter={54}
              />
            </div>
          </div>
          { redirect ? null : this.renderAccountInfo(selectedIdentities[0]) }
        </section>
      </div>
    )
  }

  renderRequestedPermissions () {
    const {
      selectedPermissions, permissionsDescriptions, onPermissionToggle,
    } = this.props
    const { t } = this.context

    const items = Object.keys(selectedPermissions).map((methodName) => {

      // the request will almost certainly be reject by rpc-cap if this happens
      if (!permissionsDescriptions[methodName]) {
        console.warn(`Unknown permission requested: ${methodName}`)
      }
      const description = permissionsDescriptions[methodName] || methodName
      // don't allow deselecting eth_accounts
      const isDisabled = methodName === 'eth_accounts'

      return (
        <div
          className="permission-approval-container__content__permission"
          key={methodName}
          onClick={() => {
            if (!isDisabled) {
              onPermissionToggle(methodName)
            }
          }}
        >
          { selectedPermissions[methodName]
            ? <i className="fa fa-check-circle fa-sm" />
            : <i className="fa fa-circle fa-sm" />
          }
          <label>{description}</label>
        </div>
      )
    })

    return (
      <div className="permission-approval-container__content__requested">
        {items}
        <div className="permission-approval-container__content__revoke-note">{ t('revokeInPermissions') }</div>
      </div>
    )
  }

  getAccountDescriptor (identity) {
    return `${identity.label} (...${identity.address.slice(identity.address.length - 4)})`
  }

  renderAccountTooltip (textContent) {
    const { selectedIdentities } = this.props
    const { t } = this.context

    return (
      <Tooltip
        key="all-account-connect-tooltip"
        position="bottom"
        wrapperClassName="permission-approval-container__bold-title-elements"
        html={(
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            { selectedIdentities.slice(0, 6).map((identity, index) => {
              return (
                <div key={ `tooltip-identity-${index}` }>
                  { this.getAccountDescriptor(identity) }
                </div>
              )
            }) }
            { selectedIdentities.length > 6
              ? t('plusXMore', [ selectedIdentities.length - 6 ])
              : null
            }
          </div>
        )}
      >{ textContent }
      </Tooltip>
    )
  }

  renderTitleSubstituteText (name, key = 'title-substitute-text') {
    return (
      <div
        key={key}
        className="permission-approval-container__bold-title-elements"
      >
        { name }
      </div>
    )
  }

  getTitleArgs () {
    const { domainMetadata, redirect, permissionRejected, selectedIdentities, allIdentitiesSelected } = this.props
    const { t } = this.context

    if (redirect && permissionRejected) {
      return [ 'cancelledConnectionWithMetaMask' ]
    } else if (redirect) {
      return [ 'connectingWithMetaMask' ]
    } else if (domainMetadata.extensionId) {
      return [ 'externalExtension', [domainMetadata.extensionId] ]
    } else if (allIdentitiesSelected) {
      return [
        'likeToConnectAll',
        [
          this.renderTitleSubstituteText(domainMetadata.name),
          <div
            key="multi-account-connect-all-accounts"
            className="permission-approval-container__bold-title-elements"
          >
            { t('likeToConnectAllAllOfYour', [
              this.renderAccountTooltip(t('likeToConnectAllAccounts')),
            ]) }
          </div>,
        ],
      ]
    } else if (selectedIdentities.length > 1) {
      return [
        'likeToConnectMultiple',
        [
          this.renderTitleSubstituteText(domainMetadata.name),
          this.renderAccountTooltip(t('likeToConnecNumberOfAccounts', [ selectedIdentities.length ])),
        ],
      ]
    } else {
      return [
        'likeToConnect', [
          this.renderTitleSubstituteText(domainMetadata.name, 'title-substitute-text-dapp-name'),
          this.renderTitleSubstituteText(this.getAccountDescriptor(selectedIdentities[0]), 'title-substitute-text-account-name'),
        ],
      ]
    }
  }

  render () {
    const { domainMetadata, redirect } = this.props
    const { t } = this.context

    const titleArgs = this.getTitleArgs()

    return (
      <div className={classnames('permission-approval-container__content', {
        'permission-approval-container__content--redirect': redirect,
      })}
      >
        {this.renderPermissionApprovalVisual()}
        <div className="permission-approval-container__title">
          { t(...titleArgs) }
        </div>
        { !redirect
          ? (
            <section className="permission-approval-container__permissions-container">
              <div className="permission-approval-container__permissions-header">
                { domainMetadata.extensionId
                  ? t('thisWillAllowExternalExtension', [domainMetadata.extensionId])
                  : t('thisWillAllow', [domainMetadata.name])
                }
              </div>
              { this.renderRequestedPermissions() }
            </section>
          )
          : (
            <div className="permission-approval-container__permissions-header-redirect">
              { t('redirectingBackToDapp') }
            </div>
          )
        }
      </div>
    )
  }
}

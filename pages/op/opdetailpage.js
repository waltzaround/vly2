import { Component } from 'react'
import Link from 'next/link'
import { FormattedMessage } from 'react-intl'
import { Button, Popconfirm, message, Divider } from 'antd'
import reduxApi, { withOps } from '../../lib/redux/reduxApi.js'
import publicPage, { FullPage } from '../../hocs/publicPage'
import Router from 'next/router'
import OpDetail from '../../components/Op/OpDetail'
import InterestSection from '../../components/Interest/interestSection'
import RegisterInterestSection from '../../components/Interest/RegisterInterestSection'
import PropTypes from 'prop-types'
import PersonCard from '../../components/Person/PersonCard'

export class OpDetailPage extends Component {
  static async getInitialProps ({ store, query }) {
    // Get one Op
    // console.log('getting op details', query)
    try {
      const ops = await store.dispatch(reduxApi.actions.opportunities.get(query))
      // console.log('got ops for id', query, ops)
      return { ops, query }
    } catch (err) {
      // console.log('error in getting ops', err)
    }
  }

  // Called when the user confirms they want to delete an op
  async handleDelete (op) {
    if (!op) return
    // Actual data request
    await this.props.dispatch(reduxApi.actions.opportunities.delete({ id: op._id }))
    // TODO error handling - how can this fail?
    message.success('Deleted. ')
    Router.replace(`/ops`)
  }

  // Called when the user starts to delete an op, but then cancels it.
  handleDeleteCancelled = () => { message.error('Delete Cancelled') }

  // Called when the user registers interest in an op
  handleRegisterInterest (op) {

  }

  render () {
    let content
    if (this.props.ops && this.props.ops.length === 1) {
      const op = this.props.ops[0]
      const organizer = this.props.opportunities.data[0].requestor
      const isOwner = this.props.me._id == organizer._id
      
      console.log('111',this.props)
      // TODO add condition that when volunteer finished the comment then show organizer's contact
      const organizerSection = () => {
        return (true)
          ? <div>
            <PersonCard style={{ width: '300px' }} person={organizer}/>
          </div>
          : null
      }
      const interestedSection = () => {
        return (this.props.isAuthenticated &&
          this.props.me &&
          !isOwner)
          ? <div>
            <RegisterInterestSection op={op._id} me={this.props.me._id} />
            <Divider />
          </div>
          : <div>
            'Need to be signed in as a volunteer instead of organizer to be interested'
            <Divider />
          </div>
      }
      const requestSection = () => {
        return (isOwner || this.props.me &&this.props.me.role.includes('admin'))
          ? <div>
              {/* These components should only appear if a user is logged in and viewing an op they DID create themselves. */}
              <div>
                <Link href={`/ops/${op._id}/edit`} >
                  <Button type='secondary' shape='round' >
                    <FormattedMessage id='editOp' defaultMessage='Edit' description='Button to edit an opportunity on OpDetails page' />
                  </Button>
                </Link>
                &nbsp;
                <Popconfirm title='Confirm removal of this opportunity.' onConfirm={this.handleDeleteOp} onCancel={this.cancel} okText='Yes' cancelText='No'>
                  <Button type='danger' shape='round' >
                    <FormattedMessage id='deleteOp' defaultMessage='Remove Request' description='Button to remove an opportunity on OpDetails page' />
                  </Button>
                </Popconfirm>
                <Divider />
              </div>

              {/* Remove this message when appropriate. */}
              <div>
                <small>visible buttons here depend on user role</small>
              </div>

              {/* These components should only appear if a user is logged in and viewing an op they DID create themselves. */}
              <div>
                <h2>Interested Volunteers</h2>
                <InterestSection op={op._id} />
              </div>
            </div>
          : null
      }
      // TODO: [VP-161] In register interest section, if person not signed in show Sign In button
      content =
        (<div>
          <OpDetail op={op} />
          <Divider />
          {interestedSection()}

          {requestSection()}
          {organizerSection()}

          
        </div>)
    } else {
      content =
        (<div>
          <h2>Sorry this opportunity is no longer available</h2>
          <Link href={'/ops'} ><a>Search for some more</a></Link>
          <p>or </p>
          <Link href={'/ops/new'} ><a>create a new opportunity</a></Link>
        </div>)
    }
    return (<FullPage>{content}</FullPage>)
  }
}

OpDetailPage.propTypes = {
  op: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    imgUrl: PropTypes.any,
    duration: PropTypes.string,
    location: PropTypes.string,
    _id: PropTypes.string.isRequired
  }),
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  })
}

export default publicPage(withOps(OpDetailPage))
